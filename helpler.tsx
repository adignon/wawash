import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";


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
        if (typeof errorMessage != 'string') {
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

export function capitalize(text?: string, firstLetter = true) {
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
    } catch (error:any) {
        Logger.error("Error getting device token:", error);
        throw error;
    }
}

