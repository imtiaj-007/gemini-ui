# Gemini Frontend Clone

This project is a fully functional, responsive, and visually appealing frontend for a Gemini-style conversational AI chat application. Built with Next.js 15, TypeScript, Tailwind CSS, and Shadcn/ui.

## ✨ Live Demo

[Deployed Vercel Link](https://clone-gemini-ui.vercel.app)

| Preview | Description |
|---------|-------------|
| ![Login Form](/login-form.png) | Login form interface |
| ![OTP Form](/otp-form.png) | OTP verification interface |
| ![Dashboard](/page-ui.png) | Main dashboard interface |
| ![Chat UI](/chat-ui.png) | Chat conversation interface |

## 🚀 Project Overview

This application simulates a complete chat experience, from OTP-based authentication to real-time messaging with a mock AI response. It's designed to showcase modern frontend development techniques and best practices.

### Core Features:
- **OTP Authentication:** Secure login/signup flow with country code selection.
- **Dashboard:** Manage chatrooms with create, delete, and search functionality.
- **Chat Interface:** Real-time messaging with typing indicators, image uploads, and message history.
- **Global UX:** Dark mode, toast notifications, loading skeletons, and full mobile responsiveness.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui
- **Animations:** Framer Motion
- **State Management:** Zustand
- **Form Validation:** React Hook Form + Zod
- **Deployment:** Vercel

## 📁 Folder & Component Structure

The project follows a modular structure to ensure scalability and maintainability.

```
/src
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Authentication routes
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (main)/           # Main application routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── layout.tsx
├── components/           # Reusable UI components
│   ├── chat/             # Chat specific components
│   ├── core/             # Core components (Button, Input, etc.)
│   └── theme/            # Theme toggle, etc.
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configs
├── store/                # Zustand state management
└── styles/               # Global styles
```

## ⚙️ Setup and Run Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/imtiaj-007/gemini-ui.git
    cd gemini-clone
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧠 Implementation Details

### Throttling & Debouncing

- **Throttling:** The AI's responses are throttled using a custom [`useThrottle`](./src/hooks/use-throttle.ts) hook to simulate thinking time and prevent API spam. This hook ensures that a function cannot be called more than once within a specified delay, which is useful for rate-limiting actions like sending messages or triggering expensive operations.

  **Hook Implementation:**
  ```ts
  import { useRef, useEffect, useCallback } from 'react';

  export function useThrottle<T extends (...args: any[]) => any>(
      callback: T,
      delay: number
  ) {
      const callbackRef = useRef(callback);
      const timeoutRef = useRef<NodeJS.Timeout | null>(null);
      const lastArgsRef = useRef<Parameters<T> | null>(null);

      useEffect(() => {
          callbackRef.current = callback;
      }, [callback]);

      const throttledFunction = useCallback((...args: Parameters<T>) => {
          lastArgsRef.current = args;
          if (!timeoutRef.current) {
              timeoutRef.current = setTimeout(() => {
                  if (lastArgsRef.current) {
                      callbackRef.current(...lastArgsRef.current);
                      lastArgsRef.current = null;
                  }
                  timeoutRef.current = null;
              }, delay);
          }
      }, [delay]);

      return throttledFunction;
  }
  ```

  **Usage Example:**
  ```tsx
  import { useThrottle } from '@/hooks/use-throttle';

  function MyComponent() {
      const throttledLog = useThrottle((msg: string) => {
          console.log(msg);
      }, 1000);

      return (
          <button onClick={() => throttledLog('Clicked!')}>
              Throttled Click
          </button>
      );
  }
  ```

  **How it works:**  
  - The `useThrottle` hook returns a throttled version of your callback.
  - Calls to the throttled function within the delay window are ignored, except for the last call, which is executed after the delay.
  - This is especially useful for preventing rapid-fire API calls or UI updates in response to user actions.

- **Debouncing:** The useDebounce hook is a utility that helps delay the update of a value until a specified amount of time has passed without the value changing. This is particularly useful for scenarios like search inputs where you want to wait until the user stops typing before making an API call. The chatroom search bar uses a custom [`useDebounce`](./src/hooks/use-debounce.ts) hook to delay search queries, improving performance.

  **Hook Implementation:**
  ```ts
  import { useState, useEffect } from 'react';
  
  export function useDebounce<T>(value: T, delay: number): T {
      const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
      useEffect(() => {
          const handler = setTimeout(() => {
              setDebouncedValue(value);
          }, delay);
  
          return () => {
              clearTimeout(handler);
          };
      }, [value, delay]);
  
      return debouncedValue;
  }
  ```

  **Usage Example:**
  ```tsx
  import { useDebounce } from '@/hooks/use-debounce';

  function SearchInput() {
      const [search, setSearch] = useState('');
      const debouncedSearch = useDebounce(search, 500);

      useEffect(() => {
          if (debouncedSearch) {
              console.log('Searching for:', debouncedSearch);
          }
      }, [debouncedSearch]);

      return (
          <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Type to search..."
          />
      );
  }
  ```

  **How it works:**  
  - The `useDebounce` hook returns a debounced version of your value.
  - When the value changes, the hook waits for the specified delay (e.g., 500ms). If the value changes again before the delay is over, the timer resets.
  - Only after the value has stopped changing for the full delay does the debounced value update.
  - This is especially useful for scenarios like search inputs, where you want to avoid making API calls or expensive computations on every keystroke, and instead wait until the user has finished typing.

### Reverse Infinite Scroll & Pagination

- **Reverse Infinite Scroll:** The chat window supports reverse infinite scrolling, allowing users to load older messages by scrolling to the top of the chat. This is handled by listening to the scroll event on the chat container:

  ```tsx
  // Inside ChatWindow component
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
      if (chatContainerRef.current?.scrollTop === 0) {
          // Fetch and prepend older messages here
          console.log("Reached top, fetch older messages.");
      }
  };

  // Attach to the chat container
  <div
      ref={chatContainerRef}
      onScroll={handleScroll}
      className="flex-1 p-4 pt-0 overflow-y-auto"
  >
      {/* ...messages... */}
  </div>
  ```

- **Pagination:** Messages are loaded in pages (e.g., 20 at a time) to optimize performance and initial load. When the user scrolls to the top, the next page of older messages is fetched and prepended to the current message list. This approach ensures efficient rendering and smooth user experience, especially in large chat histories.

### Form Validation
- **React Hook Form & Zod:** The OTP login form uses `react-hook-form` for efficient form state management and `Zod` for robust, schema-based validation. It combines React Hook Form for form state management and Zod for schema-based validation. This ensures type safety, clean error handling, and efficient form performance.

  **Type and Schema Defination**
  ```tsx
  interface AuthFormData {
      countryCode: string;
      phone: string;
      otp: string;
  }
  
  const phoneRegex = /^[0-9]{10,15}$/;
  const otpRegex = /^[0-9]{6}$/;
  
  const formSchema = z.object({
      countryCode: z.string().min(1, { message: "Country code is required." }),
      phone: z.string().regex(phoneRegex, 'Invalid phone number!'),
      otp: z.string().regex(otpRegex, 'OTP must be exactly 6 digits.'),
  });
  ```

  **Usage Instruction:**
  ```tsx
  export default function LoginPage() {
    const form = useForm<AuthFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            countryCode: "",
            phone: "",
            otp: "",
        },
        mode: 'onChange'
    });

    // Form submission handler
    const handleSubmit = async (values: AuthFormData) => {
        // Handle form submission logic here
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                {/* Form fields with FormField components */}
                <FormField
                    control={form.control}
                    name="countryCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Country Code</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* Other form fields */}
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
  }
  ```
  For the full implementation, see: [`src/app/(auth)/login/page.tsx`](./src/app/(auth)/login/page.tsx).

## 🧪 Testing

Testing is not yet implemented in the project, but it's highly encouraged to add comprehensive test coverage. In future updates, we plan to implement:

- Unit tests with Jest and React Testing Library
- End-to-end tests with Cypress
- Integration tests for critical workflows

Here are some sample test snippets that could be implemented:

- **Testing Validation Schema:**
  ```ts
  describe('formSchema validation', () => {
    it('should validate correct phone number', () => {
      const validPhone = { phone: '1234567890' };
      expect(formSchema.safeParse(validPhone).success).toBe(true);
    });

    it('should reject invalid phone number', () => {
      const invalidPhone = { phone: 'abc123' };
      expect(formSchema.safeParse(invalidPhone).success).toBe(false);
    });

    it('should validate correct OTP', () => {
      const validOtp = { otp: '123456' };
      expect(formSchema.safeParse(validOtp).success).toBe(true);
    });

    it('should reject OTP with wrong length', () => {
      const invalidOtp = { otp: '12345' };
      expect(formSchema.safeParse(invalidOtp).success).toBe(false);
    });
  });
  ```

- **Testing OTP Input Component:**
  ```tsx
  describe('OTPInput component', () => {
    it('should render correct number of inputs', () => {
      render(<OTPInput length={6} onChange={jest.fn()} />);
      expect(screen.getAllByRole('textbox')).toHaveLength(6);
    });

    it('should only allow numeric input', () => {
      const onChange = jest.fn();
      render(<OTPInput length={6} onChange={onChange} />);
      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'a' } });
      expect(onChange).not.toHaveBeenCalled();
    });
  });
  ```

- **Testing Resend OTP Functionality:**
  ```tsx
  describe('ResendOTP component', () => {
    it('should show cooldown timer when clicked', () => {
      const onResend = jest.fn();
      render(<ResendOTP onResend={onResend} disabled={false} />);
      fireEvent.click(screen.getByText('Resend OTP'));
      expect(screen.getByText(/Resend OTP in \d+s/)).toBeInTheDocument();
    });

    it('should not allow resend during cooldown', () => {
      const onResend = jest.fn();
      render(<ResendOTP onResend={onResend} disabled={false} />);
      fireEvent.click(screen.getByText('Resend OTP'));
      fireEvent.click(screen.getByText(/Resend OTP in \d+s/));
      expect(onResend).toHaveBeenCalledTimes(1);
    });
  });
  ```

## 📑 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
