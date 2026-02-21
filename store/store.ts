import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { IAddress, User } from "./type";



type AuthState = {
    accessToken: string | null,
    user: User | null;
    address: IAddress | null,
    color:"light"|"dark"|"default",
    setAddress:(x:IAddress)=>void,
    setColor: (color:"light"|"dark"|"default") =>void,
    clearAddress:() => void;
    setToken: (token: string) => void;
    clearToken: () => void;
    setUser: (user: User) => void;
    clearUser: () => void;
};

export const useStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            address:null,
            color:"default",
            setColor: (color:"light"|"dark"|"default") => set({ color: color }),
            setAddress: (address:any) => set({ address }),
            clearAddress: () => set({ address: null }),
            setToken: (accessToken) => set({ accessToken }),
            clearToken: () => set({ accessToken: null }),
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
