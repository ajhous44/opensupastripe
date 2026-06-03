/**
 * Formats a phone number string into (###) ###-#### format
 * @param value The input phone number string
 * @returns The formatted phone number string
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digits
  const input = value.replace(/\D/g, '');
  let formatted = '';
  
  if (input.length > 0) {
    // Format: (###
    formatted += `(${input.substring(0, 3)}`;
    
    if (input.length > 3) {
      // Format: (###) ###
      formatted += `) ${input.substring(3, 6)}`;
      
      if (input.length > 6) {
        // Format: (###) ###-####
        formatted += `-${input.substring(6, 10)}`;
      }
    }
  }
  
  return formatted;
}

/**
 * Creates an onChange handler for phone number input fields
 * @param setter The state setter function for the phone number
 * @returns A change event handler function
 */
export function createPhoneNumberHandler(
  setter: (value: string) => void
): (e: React.ChangeEvent<HTMLInputElement>) => void {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setter(formatted);
  };
} 