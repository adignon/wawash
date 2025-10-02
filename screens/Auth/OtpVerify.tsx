import { t } from "i18next";
import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Path, Svg } from "react-native-svg";
export function OtpVerifyCode() {
    const { phone, retryAt, token } = useLocalSearchParams<{ token: string, phone: string, retryAt: string }>()
    const setUser = useStore((s) => s.setUser);
    const handleRetry = async () => {
        try {
            const data = await otpVerify({
                phone
            })
            router.setParams({ retryAt: data.retryAt, token: data.otpToken })
            Toast.show({
                text1: data.message,
                type: "success"
            })
        } catch (e: any) {
            Toast.show({
                text2: e,
                type: "error"
            })
        }
    }
    const setToken = useStore((s) => s.setToken);
    const handleSubmit = async (code: string) => {
        try {
            const data = await otpVerifyCode({
                phone,
                otp: code,
                token
            })
            Toast.show({
                text1: data.message,
                type: "success"
            })
            setUser(data.user)
            setToken(data.acessToken.token)
            if (data.user) {
                router.push({
                    pathname: "/auth/welcome",
                    params: {
                        firstname: capitalize(data.user.firstname),
                    }
                })
            } else {
                router.push({
                    pathname: "/auth/create-profile",
                    params: {
                        phone,
                        token
                    }
                })
            }

        } catch (e: any) {
            Toast.show({
                text2: e,
                type: "error"
            })
        }
    }
    return (
        <SafeView safeZone="bottom" className="flex-1">
            <Header title={t("Confirmation du code")} />
            <View className="mt-6">
                <Text className="text-center font-jakarta-bold text-[25px] text-dark dark:text-white">{t("Entrez le code")}</Text>
                <Text className="mt-4 text-center text-jakarta text-dark-400 text-[14px]">{t("Nous vous avons envoyer le code de confirmation sur le")} <Text className="font-jakarta-semibold ">{phone}</Text></Text>
            </View>
            <View className="mt-14">
                <AnimatedStripeOTPInput onCompleted={handleSubmit} />
            </View>
            <View>
                <OtpRetry
                    onRetry={handleRetry}
                    nextRetryAt={new Date(retryAt)}
                />
            </View>
        </SafeView>
    )
}

type OtpRetryProps = {
    nextRetryAt: Date | number; // can pass a Date or timestamp
    onRetry: () => Promise<void> | void;
};

export default function OtpRetry({ nextRetryAt, onRetry }: OtpRetryProps) {
    const [remaining, setRemaining] = useState<number>(0);
    const [loading, setLoading] = React.useState(false)
    useEffect(() => {
        const target = typeof nextRetryAt === "number" ? nextRetryAt : nextRetryAt.getTime();

        const interval = setInterval(() => {
            const diff = Math.max(0, Math.floor((target - Date.now()) / 1000)); // in seconds
            setRemaining(diff);
            if (diff <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [nextRetryAt]);

    const handleResend = async () => {
        setLoading(true)
        await onRetry();
        setLoading(false)
    };
    // format mm:ss
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };
    const disabled = remaining > 0
    return (
        <View style={{ alignItems: "center", marginTop: 20 }}>
            <TouchableOpacity disabled={disabled} onPress={handleResend} className="mt-4 flex-row items-center gap-x-4">
                {
                    loading ?
                        <View className="w-[30px] h-[30px]">
                            <LottieView autoPlay loop style={{ flex: 1 }} colorFilters={[{ keypath: "Shape Layer 1.Stroke 1", color: theme.extend.colors.primary.DEFAULT }]} source={require("@/assets/lotties/loading-1.json")} />
                        </View>
                        :
                        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <Path d="M9.11008 5.0799C9.98008 4.8199 10.9401 4.6499 12.0001 4.6499C16.7901 4.6499 20.6701 8.5299 20.6701 13.3199C20.6701 18.1099 16.7901 21.9899 12.0001 21.9899C7.21008 21.9899 3.33008 18.1099 3.33008 13.3199C3.33008 11.5399 3.87008 9.8799 4.79008 8.4999" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <Path d="M7.87012 5.32L10.7601 2" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <Path d="M7.87012 5.32007L11.2401 7.78007" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                }

                {
                    !disabled ?

                        <Text className="text-[14px] font-jakarta-semibold text-primary">{t("Renvoyer le code")}</Text>
                        :
                        <Text className="text-[14px] font-jakarta text-primary ">{t("Renvoyez dans ")}{formatTime(remaining)}</Text>
                }

            </TouchableOpacity>
        </View>
    );
}


import type { OTPInputRef } from 'input-otp-native';
import { OTPInput, type SlotProps } from 'input-otp-native';
import { useRef } from 'react';

import { otpVerify, otpVerifyCode } from "@/api/auth";
import { Header } from "@/components/Header";
import { Text } from "@/components/Themed";
import { SafeView } from "@/components/View";
import { capitalize, clx } from "@/helpler";
import { useStore } from "@/store/store";
import { theme } from "@/tailwind.config";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import Toast from "react-native-toast-message";

export function AnimatedStripeOTPInput({ onCompleted }: { onCompleted: (x: string) => Promise<void> }) {
    const ref = useRef<OTPInputRef>(null);
    const onComplete = async (code: string) => {
        await onCompleted(code);
        ref.current?.clear();
    };

    return (
        <View>
            <OTPInput
                ref={ref}
                onComplete={onComplete}
                maxLength={6}
                render={({ slots }) => (
                    <View className="flex-1 flex-row items-center justify-center my-4">
                        <View className="flex-row">
                            {slots.slice(0, 3).map((slot, idx) => (
                                <Slot key={idx} {...slot} index={idx} />
                            ))}
                        </View>
                        <FakeDash />
                        <View className="flex-row">
                            {slots.slice(3).map((slot, idx) => (
                                <Slot key={idx} {...slot} index={idx + 3} />
                            ))}
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

function Slot({
    char,
    isActive,
    hasFakeCaret,
    index,
}: SlotProps & { index: number }) {
    const isFirst = index === 3 || index === 0;
    const isLast = index === 2 || index === 5;

    return (
        <View
            className={clx(
                `w-14 h-16 items-center justify-center bg-gray-50 relative dark:bg-dark`,
                'border-t border-b border-l border-gray dark:border-dark-border dark:bg-dark-lighter',
                {
                    'rounded-r-lg border-r': isLast,
                    'rounded-l-lg': isFirst,
                    'bg-white border-black': isActive,
                }
            )}
        >
            {char !== null && (
                <Animated.View
                    entering={FadeInDown.springify()
                        .damping(15)
                        .stiffness(150)
                        .mass(1)
                        .overshootClamping(0)}
                >
                    <Text className="text-[20px] font-jakarta-semibold text-gray-900">{char}</Text>
                </Animated.View>
            )}
            {hasFakeCaret && <FakeCaret />}
        </View>
    );
}

function FakeDash() {
    const opacity = useSharedValue(0.5);
    const scale = useSharedValue(1);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.2, { duration: 1000 }),
                withTiming(0.8, { duration: 1000 })
            ),
            -1,
            true
        );

        scale.value = withRepeat(
            withSequence(
                withTiming(0.8, { duration: 1000 }),
                withTiming(1.2, { duration: 1000 })
            ),
            -1,
            true
        );
    }, [opacity, scale]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    return (
        <View className="w-8 items-center justify-center">
            <Animated.View
                style={animatedStyle}
                className="w-2 h-0.5 bg-gray-200 rounded-sm"
            />
        </View>
    );
}

function FakeCaret() {
    const opacity = useSharedValue(1);
    const height = useSharedValue(24);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 500 }),
                withTiming(1, { duration: 500 })
            ),
            -1,
            true
        );

        height.value = withRepeat(
            withSequence(
                withTiming(20, { duration: 500 }),
                withTiming(28, { duration: 500 })
            ),
            -1,
            true
        );
    }, [opacity, height]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        height: height.value,
    }));
    const { colorScheme } = useColorScheme()
    const baseStyle = {
        width: 2,
        backgroundColor: colorScheme == "light" ? '#111827' : theme.extend.colors.gray.DEFAULT,
        borderRadius: 1,
    };

    return (
        <View className="absolute w-full h-full items-center justify-center">
            <Animated.View style={[baseStyle, animatedStyle]} />
        </View>
    );
}