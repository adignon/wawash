import { getStatistics } from '@/api/merchants';
import { getAdress } from '@/api/subscription';
import { NotificationButton } from '@/components/Header';
import { Logo } from '@/components/Logo';
import { ProfileImage } from '@/components/ProfileImage';
import { ErrorRetry } from '@/components/State';
import { Text } from '@/components/Themed';
import { capitalize, clx } from '@/helpler';
import { useStore } from '@/store/store';
import { useQuery } from '@tanstack/react-query';
import Decimal from 'decimal.js';
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
    const { bottom } = useSafeAreaInsets()
    const queryStatistics = useQuery({
        queryKey: ["statiscs"],
        queryFn: getStatistics
    })
    const data = queryStatistics.data
    const isLoading = queryStatistics.isLoading
    console.log(data)
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
                            <View style={{ borderRadius: 40 }} className='absolute right-5 bottom-5 px-2 py-1  bg-primary/80'>
                                <Text className='font-jakarta text-dark/60 text-[12px] dark:text-dark/80'>{t("Espace Blanchisseur")}</Text>
                            </View>
                        </LinearGradient>
                    </View>
                    <ScrollView className='flex-1' style={{ paddingBottom: bottom + 100 }}>
                        <View className='mt-8 px-4'>
                            <Text className='text-[20px] font-jakarta-bold text-primary dark:text-primary '>{t("Statistiques")}</Text>
                        </View>
                        {
                            (queryStatistics.isLoading || queryStatistics.data) ? (
                                <>
                                    <View className='mt-6 px-4 flex-row items-start gap-x-4'>
                                        <View className='rounded-[20px] flex-1 p-4  bg-white shadow-lg dark:bg-dark-lighter gap-y-2 h-[120px]  justify-between'>
                                            <Text className='font-jakarta-medium text-dark-400 text-[14px] dark:text-gray-200'>{t("Commandes totales traitées")}</Text>

                                            <View className='flex-row justify-end '>
                                                <View className={clx(isLoading && "bg-dark-300 h-[30px] w-6/12 rounded-full ", 'flex-row flex-1 justify-end')}>
                                                    {
                                                        !isNaN(data?.commandTotal!) ? (
                                                            <Text className='font-jakarta-bold text-[30px] text-primary dark:text-primary text-right flex-1 '>{data?.commandTotal??0}<Text className='font-jakarta-bold text-[16px] text-primary dark:text-primary'> {t("Kg")}</Text></Text>
                                                        ) : <></>
                                                    }
                                                </View>
                                            </View>
                                        </View>
                                        <View className='rounded-[20px]  flex-1  p-4 bg-white shadow-lg dark:bg-dark-lighter  h-[120px] justify-between'>
                                            <Text className='font-jakarta-medium text-dark-400 text-[14px] dark:text-gray-200'>{t("Kg totaux traitées")}</Text>
                                            <View className='flex-row justify-end'>
                                                <View className={clx(isLoading && "bg-dark-300 h-[30px] w-6/12 rounded-full",  'flex-row flex-1 justify-end')}>
                                                    {
                                                        !isNaN(data?.totalKg!) ? (
                                                            <Text className='font-jakarta-bold text-[30px] text-primary dark:text-primary text-right'>{data?.totalKg??0}</Text>
                                                        ) : <></>
                                                    }
                                                </View>
                                            </View>

                                        </View>
                                    </View>
                                    <View className='px-4 '>
                                        <View className='mt-4 rounded-[20px]  flex-1  p-4 bg-white shadow-lg dark:bg-dark-lighter  h-[120px] justify-between'>
                                            <Text className='font-jakarta-medium text-dark-400 text-[14px] dark:text-gray-200'>{t("Revenus total généré")}</Text>
                                            <View className='flex-row justify-end'>
                                                <View className={clx(isLoading && "bg-dark-300 h-[30px] w-6/12 rounded-full",  'flex-row flex-1 justify-end')}>
                                                    {
                                                        !isNaN(data?.incomes!) ? (
                                                            <Text className='font-jakarta-bold text-[30px] text-primary dark:text-primary text-right'>{Decimal(data?.incomes??0).toNumber()}<Text className='font-jakarta-bold text-[16px] text-primary dark:text-primary'> {t("f")}</Text></Text>
                                                        ) : <></>
                                                    }
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </>

                            ) : (
                                <></>
                            )
                        }
                        {
                            query.isError ? (
                                    <ErrorRetry retry={queryStatistics.refetch}/>
                                ):<></>
                        }
                    </ScrollView>
                </View>
            </View>
        </View>
    )
}
