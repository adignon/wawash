import { getAdress } from '@/api/subscription';
import { NotificationButton } from '@/components/Header';
import { Logo } from '@/components/Logo';
import { ProfileImage } from '@/components/ProfileImage';
import { Text } from '@/components/Themed';
import { capitalize } from '@/helpler';
import { useStore } from '@/store/store';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { t } from 'i18next';
import { useColorScheme } from 'nativewind';
import { useMemo } from 'react';
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Dashboard() {
    const { top } = useSafeAreaInsets()
    const { colorScheme } = useColorScheme()
    const user = useStore(s => s.user)
    const storedAdress = useStore(s => s.address)
    const query = useQuery({
        queryKey: ["adress"],
        queryFn: getAdress
    })
    const adress = useMemo(() => {
        if (query.data) {
            return {
                ...query.data,
                location: query.data.coord,
                addLocation: Boolean(query.data.coord ?? null)
            }
        } else {
            return storedAdress
        }
    }, [query.data, storedAdress])

    return (
        <View className='bg-primary flex-1'>
            <View className="bg-white flex-1 dark:bg-dark-bg" style={{}}>
                <View className='flex-1'>
                    <View style={{
                        borderBottomStartRadius: 30,
                        borderBottomRightRadius: 30,
                        overflow: "hidden"
                    }}>
                        <LinearGradient
                            colors={
                                colorScheme == "light" ?
                                    [
                                        '#035E6E',
                                        '#04788C',
                                        '#0589A0',
                                        '#06B6D4',
                                        '#06B6D4']
                                    :

                                    [
                                        '#012B36', // deep teal
                                        '#024450', // dark cyan
                                        '#036370', // medium teal
                                        '#048094', // brighter accent (keeps identity)
                                    ]
                            }
                            locations={[0, 0.33, 0.33, 0.57, 1]}
                            start={{ x: 0, y: 0.3 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                                paddingTop: top,

                            }}
                        >
                            <View className='px-5'>
                                <View>
                                    <View className='flex-row items-center justify-between  py-2'>
                                        <Logo />
                                        <NotificationButton count={1} />
                                    </View>
                                </View>
                                <View className=' mt-4 mb-6'>
                                    <ProfileImage
                                        imageUrl={user?.imageFullUrl}
                                        height={70}
                                        width={70}
                                        icon={false}
                                    />
                                    <View className='mt-4'>
                                        <Text className='text-[18px] font-jakarta text-white dark:text-gray-100'>{t("Bienvenue,")}</Text>
                                        <Text className='text-[25px] font-jakarta-semibold text-white'>{capitalize(user?.firstname)} {capitalize(user?.lastname)}</Text>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                    <ScrollView className='flex-1'>
                        
                    </ScrollView>
                </View>
            </View>
        </View>
    )
}
