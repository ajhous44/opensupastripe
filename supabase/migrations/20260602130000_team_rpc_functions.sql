-- Team helper RPCs for organization-scoped multitenant SaaS

CREATE OR REPLACE FUNCTION public.can_add_team_member(p_organization_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_active_subscription BOOLEAN;
BEGIN
  IF NOT (
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = p_organization_id AND o.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.organization_id = p_organization_id AND tm.user_id = auth.uid()
    )
  ) THEN
    RETURN FALSE;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON sp.id = s.plan_id
    WHERE s.organization_id = p_organization_id
      AND s.status IN ('active', 'on_trial')
      AND sp.price_cents > 0
  )
  INTO v_has_active_subscription;

  RETURN COALESCE(v_has_active_subscription, FALSE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.can_add_team_member(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_team_member_count(p_organization_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF NOT (
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = p_organization_id AND o.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.organization_id = p_organization_id AND tm.user_id = auth.uid()
    )
  ) THEN
    RETURN 0;
  END IF;

  SELECT COUNT(*)::INTEGER
  INTO v_count
  FROM public.team_members
  WHERE organization_id = p_organization_id;

  RETURN COALESCE(v_count, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_team_member_count(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_organization_team_members(p_organization_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  organization_id UUID,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  IF NOT (
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = p_organization_id AND o.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.organization_id = p_organization_id AND tm.user_id = auth.uid()
    )
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    tm.id,
    tm.user_id,
    tm.organization_id,
    tm.role::TEXT,
    tm.created_at,
    tm.updated_at,
    u.email::TEXT
  FROM public.team_members tm
  INNER JOIN auth.users u ON u.id = tm.user_id
  WHERE tm.organization_id = p_organization_id
  ORDER BY tm.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_organization_team_members(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_organization_for_invite(p_invite_token TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  subdomain TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_user_email TEXT;
  v_invite_record RECORD;
BEGIN
  SELECT email::TEXT INTO v_user_email
  FROM auth.users
  WHERE id = auth.uid();

  SELECT * INTO v_invite_record
  FROM public.organization_invites
  WHERE token = p_invite_token
    AND email = v_user_email
    AND accepted_at IS NULL
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT o.id, o.name, o.subdomain
  FROM public.organizations o
  WHERE o.id = v_invite_record.organization_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_organization_for_invite(TEXT) TO authenticated;
