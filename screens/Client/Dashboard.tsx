import { LinearGradient } from 'expo-linear-gradient';
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Dashboard() {
    const { top } = useSafeAreaInsets()
    return (
        <View className="bg-white dark:bg-dark-bg">
            <View>
                <LinearGradient
                    colors={['#035E6E', '#04788C','#0589A0','#06B6D4']}
                    locations={[0, 0.33, 0.33, 0.57, 1]} // keep normalized stops
                    start={{ x: 0, y: 0.3 }}  // top-left
                    end={{ x: 1, y: 1 }}    // bottom-right (45° diagonal)
                    style={{ paddingTop: top }}
                >
                    <View className="h-[222px]" />
                </LinearGradient>
            </View>
        </View>
    )
}
