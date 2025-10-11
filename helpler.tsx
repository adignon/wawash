import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { t } from "i18next";
import Toast from "react-native-toast-message";
import { useStore } from "./store/store";


export const clx = (...classes: any[]) => classes.map(t => {
    if (typeof t == "string") {
        return Boolean(t) ? t : null
    } else if (typeof t == "object") {
        return Object.keys(t).map((d: any) => t[d] ? d : '').join(' ')
    }
}).filter(t => t).join(" ")


export const handleAxiosResponseEror = (error: any) => {
    if (error.response) {
        const errorMessage = error?.response?.data?.errors?.[0]?.message || error?.response?.data?.error?.message || error?.response?.data?.message || error?.response?.message || error?.message || "Une erreur est survenue"
        if (error.response.status == 403) {
            useStore.setState({
                accessToken: null,
                user: null,
                address: null
            })
            Toast.show({
                type: "error",
                text2: t("Session expiré! Vous avez été déconnecté. Veuillez vous connecter à nouveau.")
            })
            return router.dismissTo("/auth/otp-verification")
        }
        else if (typeof errorMessage != 'string') {
            return "Une erreur est survenue"
        }
        return errorMessage
    } else if (error.request) {

        return "Une erreur est survenue. Veuillez rééssayer."
    } else {
        // Something happened in setting up the request that triggered an Error
        return "Une erreur est survenue. Veuillez rééssayer."
    }
}

export class Logger {
    static info(message: string, ...args: any[]) {
        if (__DEV__) {
            console.log("[INFO]", message, ...args);
        }
        // Optionally send to remote service in production
    }

    static error(error: any, context?: string) {
        console.error("[ERROR]", context, error);
        // send to remote service (Sentry, LogRocket, custom API)
    }
}

export function capitalize(text?: string, firstLetter = false) {
    return text ? (firstLetter ? text[0].toUpperCase() + text.slice(1) : text.split(" ").map((t) => t[0].toUpperCase() + t.slice(1)).join(" ")) : ""
}


const DEVICE_TOKEN_KEY = "device_token";

async function generateToken(): Promise<string> {
    return Crypto.randomUUID();
}

export async function getDeviceToken(): Promise<string> {
    try {
        // Check if a token already exists
        const existingToken = await SecureStore.getItemAsync(DEVICE_TOKEN_KEY);
        if (existingToken) {
            return existingToken;
        }

        // Generate and store new token
        const newToken = await generateToken();
        await SecureStore.setItemAsync(DEVICE_TOKEN_KEY, newToken);

        return newToken;
    } catch (error: any) {
        Logger.error("Error getting device token:", error);
        throw error;
    }
}



export function formatPrice(value: number, currency: string = "XOF") {
    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency,
        minimumFractionDigits: 0, // change to 2 if you always want decimals
    }).format(value)
}


export const fnPart = (amount: string | number, country: any) => {
    try {
        const d = fn(amount, country)
        return splitCurrencyParts(d);
    } catch (e) {
        return {
            main: `${amount}`,
            prefix: country.currency,
            suffix: ""
        }
    }
}

export const fn = (amount: string | number, country: any) => {
    try {

        return new Intl.NumberFormat(country.locale, {
            style: 'currency',
            currency: country.currency, // West African CFA Franc
        }).format(Number(amount));
    } catch (e) {
        return `${country.currency} ${amount}`
    }
}


export const splitCurrencyParts = (formatted: string) => {
    const parts = {
        prefix: [] as string[],
        main: [] as string[],
        suffix: [] as string[],
    };

    let stage: 'prefix' | 'main' | 'suffix' = 'prefix';
    // Split by spaces or keep each segment
    formatted.split(/\s+/).forEach((t) => {
        if (/^\d[\d,.]*$/.test(t) || (stage == "main" && /\s/.test(t))) {
            // Number detected
            stage = 'main';
            parts.main.push(t);
        } else {
            // Text detected
            if (stage === 'prefix') {
                parts.prefix.push(t);
            } else if (stage === 'main') {
                stage = 'suffix';
                parts.suffix.push(t);
            } else {
                parts.suffix.push(t);
            }
        }
    });

    return {
        prefix: parts.prefix.join(" "),
        main: parts.main.join(" "),
        suffix: parts.suffix.join(" ")
    };;
};

