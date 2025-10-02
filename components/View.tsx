import { clx } from "@/helpler";
import { View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ISafeView extends ViewProps{
    safeZone?:"top"|"bottom",
    transparent?:boolean
}
export function SafeView({transparent, style, safeZone,className, ...props}:ISafeView){
    const {top, bottom}=useSafeAreaInsets()
    return (
        <View style={{
            paddingTop: !safeZone || safeZone=="top" ? top : 0,
            paddingBottom: !safeZone || safeZone=="bottom" ? bottom : 0,
            ...(style as any),
        }} className={clx(transparent? "":"bg-light dark:bg-dark-bg ",className)}  {...props}/>
    )
}