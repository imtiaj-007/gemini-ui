/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Smartphone, Globe } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ComboBox } from "@/components/ui/combo-box";
import { Country, useAuthStore } from "@/store/auth";
import { toast } from "sonner";


// Zod schema for form validation
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

// Reusable OTP Input Component
interface OTPInputProps {
    length?: number;
    onChange: (value: string) => void;
    disabled?: boolean;
}

interface ResendOTPProps {
    onResend: () => void;
    disabled: boolean;
    cooldownSeconds?: number;
}

function OTPInput({ length = 6, onChange, disabled = false }: OTPInputProps) {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>(
        Array(length).fill(null)
    );

    const handleOtpChange = useCallback((index: number, inputValue: string): void => {
        if (!/^\d*$/.test(inputValue)) {
            toast.warning("Invalid OTP Character", {
                description: "Only numeric values are allowed, i.e. 0-9",
            });
            return;
        }
        const newOtp = [...otp];
        newOtp[index] = inputValue;
        setOtp(newOtp);

        onChange(newOtp.join(''));
        if (inputValue && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }, [otp, onChange, length]);

    const handleKeyDown = useCallback((
        index: number,
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }, [otp]);

    return (
        <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
                <Input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={disabled}
                    className="w-12 h-12 text-center text-xl focus:ring-2 focus:ring-blue-500"
                    inputMode="numeric"
                    pattern="\d{1}"
                    placeholder="•"
                />
            ))}
        </div>
    );
}

// Country Code Selector Component
interface CountryCodeSelectorProps {
    value: string;
    onChange: (value: string) => void;
    countries: Country[];
    loading: boolean;
    disabled?: boolean;
}

function CountryCodeSelector({
    value,
    onChange,
    countries,
    loading,
    disabled = false
}: CountryCodeSelectorProps) {
    const countryOptions = countries.map((country) => {
        const dialCode = `${country.idd?.root}${country.idd?.suffixes?.[0] || ''}`;
        return {
            value: dialCode,
            label: (
                <div className="flex items-center gap-2">
                    <Image
                        src={country.flags.svg || country.flags.png}
                        alt={country.flags.alt || `${country.name.common} flag`}
                        width={200}
                        height={120}
                        className="h-4 w-6 object-contain rounded"
                    />
                    <span className="font-medium">{country.cca3}</span>
                    <span className="text-xs">{dialCode}</span>
                </div>
            ),
            name: country.name.common
        };
    });

    return (
        <div className="w-full space-y-2">
            <FormLabel>
                <span className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    Code
                </span>
            </FormLabel>
            <FormControl>
                <ComboBox
                    value={value}
                    onChange={onChange}
                    options={countryOptions}
                    placeholder={loading ? "Loading..." : "Code"}
                    width="100%"
                    inputPlaceholder="Search country code..."
                    disabled={loading || disabled}
                />
            </FormControl>
        </div>
    );
}

// Phone Input Component
interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

function PhoneInput({ value, onChange, disabled = false }: PhoneInputProps) {
    return (
        <div className="w-full space-y-2">
            <FormLabel>
                <span className="flex items-center gap-1">
                    <Smartphone className="w-4 h-4" />
                    Phone
                </span>
            </FormLabel>
            <FormControl>
                <Input
                    placeholder="9876543210"
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={15}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                />
            </FormControl>
        </div>
    );
}

// Resend OTP Component
function ResendOTP({ onResend, disabled, cooldownSeconds = 30 }: ResendOTPProps) {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [canResend, setCanResend] = useState<boolean>(true);

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;

        if (timeLeft > 0) {
            setCanResend(false);
            interval = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [timeLeft]);

    const handleResend = () => {
        if (canResend && !disabled) {
            setTimeLeft(cooldownSeconds);
            onResend();
        }
    };

    return (
        <div className="text-center">
            <Button
                type="button"
                variant="ghost"
                onClick={handleResend}
                disabled={!canResend || disabled}
                className="text-sm text-muted-foreground hover:text-primary"
            >
                {!canResend ? (
                    `Resend OTP in ${timeLeft}s`
                ) : (
                    "Resend OTP"
                )}
            </Button>
        </div>
    );
}

// Main Login Page Component
export default function LoginPage() {
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = useState<boolean>(false);
    const [resendLoading, setResendLoading] = useState<boolean>(false);
    const router = useRouter();
    const { login, isAuthenticated, countries, fetchCountries } = useAuthStore();

    // Form setup
    const form = useForm<AuthFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            countryCode: "",
            phone: "",
            otp: "",
        },
        mode: 'onChange'
    });

    const { watch, setValue, trigger } = form;
    const watchedOtp = watch("otp");

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    // Fetch countries on mount
    useEffect(() => {
        if (!countries || countries.length === 0)
            fetchCountries();
    }, []);

    // Handle sending OTP
    const handleSendOtp = async () => {
        const isValid = await trigger(["countryCode", "phone"]);
        if (!isValid) return;
        setLoading(true);

        setTimeout(() => {
            setStep('otp');
            setLoading(false);
            toast.success("OTP Sent!", {
                description: "Please check your messages. The mock OTP is 123456.",
            });
        }, 2000);
    };

    // Handle resending OTP
    const handleResendOtp = async () => {
        setResendLoading(true);

        setTimeout(() => {
            setResendLoading(false);
            toast.success("OTP Resent!", {
                description: "Please check your messages. The mock OTP is 123456.",
            });
        }, 1500);
    };

    // Handle form submission
    const handleSubmit = async (values: AuthFormData) => {
        if (step === 'phone') {
            await handleSendOtp();
            return;
        }
        setLoading(true);

        setTimeout(() => {
            if (values.otp === "123456") {
                login({ phone: `${values.countryCode}${values.phone}` });
                toast.success("Login Successful!", {
                    description: "Welcome back!",
                });
                router.push("/");
            } else {
                toast.error("Invalid OTP", {
                    description: "The OTP you entered is incorrect.",
                });
                form.setError("otp", { message: "Incorrect OTP." });
            }
            setLoading(false);
        }, 2000);
    };

    const handleBackToPhone = () => {
        setStep('phone');
        setValue('otp', '');
    };

    const isCountriesLoading = countries.length === 0;
    const isFormDisabled = loading || (step === 'phone' && isCountriesLoading);

    return (
        <div className="relative bg-neutral-800/95 h-full w-full md:w-1/3 p-4">
            <Card className="absolute right-4 md:right-20 lg:right-40 top-1/2 -translate-y-1/2 transform w-md h-[75vh] dark:bg-gradient-to-br from-gray-900 via-neutral-950 to-gray-950">
                <CardHeader className="pt-20 pb-4 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight text-neutral-800 dark:text-white">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-base text-neutral-700 dark:text-gray-100 mt-2">
                        {step === 'phone'
                            ? "Sign in with your phone number to continue"
                            : "Enter the 6-digit code sent to your phone"
                        }
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                            {step === 'phone' ? (
                                <div className="flex space-x-3">
                                    <FormField
                                        control={form.control}
                                        name="countryCode"
                                        render={({ field }) => (
                                            <FormItem className="w-2/5">
                                                <CountryCodeSelector
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    countries={countries}
                                                    loading={isCountriesLoading}
                                                    disabled={isFormDisabled}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem className="w-3/5">
                                                <PhoneInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    disabled={isFormDisabled}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="otp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="sr-only">Enter OTP</FormLabel>
                                                <FormControl>
                                                    <OTPInput
                                                        onChange={field.onChange}
                                                        disabled={loading}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-center" />
                                            </FormItem>
                                        )}
                                    />
                                    <ResendOTP
                                        onResend={handleResendOtp}
                                        disabled={loading}
                                    />
                                    <div className="text-center">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleBackToPhone}
                                            disabled={loading}
                                            className="text-sm text-muted-foreground hover:text-primary"
                                        >
                                            ← Back to phone number
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <CardFooter className="p-0 pt-6 flex flex-col gap-2">
                                {step === 'phone'
                                    ? (
                                        <Button
                                            type="button"
                                            disabled={isFormDisabled}
                                            onClick={handleSendOtp}
                                            className="max-w-sm w-full text-white shadow transition bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                        >
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="animate-spin w-5 h-5" />
                                                    Sending...
                                                </span>
                                            ) : (
                                                "Send OTP"
                                            )}
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={watchedOtp.length !== 6}
                                            className="max-w-sm w-full text-white shadow transition bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                        >
                                            {(loading || resendLoading) ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="animate-spin w-5 h-5" />
                                                    {resendLoading ? 'Sending...' : 'Verifying...'}
                                                </span>
                                            ) : (
                                                'Login'
                                            )}
                                        </Button>
                                    )
                                }
                                <div className="text-xs text-muted-foreground text-center mt-2">
                                    By continuing, you agree to our{" "}
                                    <Link
                                        href="#"
                                        className="underline hover:text-primary transition"
                                    >
                                        Terms of Service
                                    </Link>
                                    .
                                </div>
                            </CardFooter>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};