import { useColorScheme } from "react-native";

export function useThemeValue<T>(props:{
    light:any,
    dark:any
}): T {
    const scheme = useColorScheme();
    return scheme ? props[scheme]:props.light;
}