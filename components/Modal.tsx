import { useThemeValue } from "@/hooks/useThemeValue";
import { theme } from "@/tailwind.config";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { t } from "i18next";
import { useColorScheme } from "nativewind";
import React, { useRef } from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Text } from "./Themed";

interface IActionModal {
    show: boolean,
    onClose: () => void,
    children?: React.ReactNode,
    title?: string | React.ReactNode,
    paddingBottom?: number
}


export function ActionModal({ show, title, onClose, children }: IActionModal) {
    const { colorScheme } = useColorScheme()
    const { bottom } = useSafeAreaInsets()
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    React.useEffect(() => {
        if (show) {
            bottomSheetModalRef.current?.present()
        } else {
            bottomSheetModalRef.current?.close()
        }
    }, [show])
    return (
        <BottomSheetModal
            enableDismissOnClose

            ref={bottomSheetModalRef}
            enableDynamicSizing={true}
            handleIndicatorStyle={{

                backgroundColor: useThemeValue({
                    dark: theme.extend.colors.gray[200],
                    light: theme.extend.colors.dark.text
                })
            }}
            onChange={(index, position, type) => {
                if (index < 0) {
                    onClose()
                }
            }}
            handleComponent={() => <View />}
            backgroundStyle={{
                backgroundColor: useThemeValue({
                    dark: theme.extend.colors.dark["dark-bg"],
                    light: '#fff'
                })

            }}
            backdropComponent={
                (props: any) => (
                    <View {...props} className="bg-dark/20" />
                )
            }
            handleStyle={{
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                backgroundColor: useThemeValue({
                    dark: theme.extend.colors.dark["dark-bg"],
                    light: '#fff'
                })
            }}
        >
            <BottomSheetView className="justify-end flex-1 bg-dark/20">
                <BottomSheetView style={{
                    paddingBottom: bottom
                }} className="rounded-t-[25px] bg-white dark:bg-dark-lighter">
                    <View className="p-4 px-4 flex-row items-center gap-x-4">
                        <TouchableOpacity onPress={onClose} className="rounded-full p-2 bg-gray-100 dark:bg-dark-400">
                            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <Path d="M15 5L5 15" stroke={colorScheme == "light" ? theme.extend.colors.dark[400] : theme.extend.colors.gray[400]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <Path d="M5 5L15 15" stroke={colorScheme == "light" ? theme.extend.colors.dark[400] : theme.extend.colors.gray[400]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </TouchableOpacity>
                        {
                            typeof (title) == "string" ? (
                                <Text className="font-jakarta-semibold text-[18px] text-dark dark:text-white">{t(title)}</Text>
                            ) : (title ?? <></>)
                        }
                    </View>
                    <View className="p-4">{children}</View>
                </BottomSheetView>
            </BottomSheetView>
        </BottomSheetModal>
    )
}


export function BasicModal({ show, title, onClose, children }: IActionModal) {
    const { colorScheme } = useColorScheme()
    const { bottom } = useSafeAreaInsets()
    return (
        <Modal
            transparent
            visible={show}
            onRequestClose={onClose}
            animationType="fade"
        >

            <View className="justify-end flex-1 bg-dark/20">
                <View style={{
                    paddingBottom: bottom
                }} className="rounded-t-[25px] bg-white dark:bg-dark-lighter">
                    <View className="pt-4 pb-0 px-4 flex-row items-center gap-x-4">
                        <TouchableOpacity onPress={onClose} className="rounded-full p-2 bg-gray-100 dark:bg-dark-400">
                            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <Path d="M15 5L5 15" stroke={colorScheme == "light" ? theme.extend.colors.dark[400] : theme.extend.colors.gray[400]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <Path d="M5 5L15 15" stroke={colorScheme == "light" ? theme.extend.colors.dark[400] : theme.extend.colors.gray[400]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </TouchableOpacity>
                        {
                            typeof (title) == "string" ? (
                                <Text className="font-jakarta-semibold text-[18px] text-dark dark:text-white">{t(title)}</Text>
                            ) : (title ?? <></>)
                        }
                    </View>
                    <View className="px-4 pb-4 ">{children}</View>
                </View>
            </View>
        </Modal>
    )
}

interface IWarningAlert {
    title?: string
    description: string
}
export function WarningAlert({ title, description }: IWarningAlert) {
    const { colorScheme } = useColorScheme()
    return (
        <View className="mb-6 flex-row items-center gap-x-4 p-4 rounded-[15px] bg-primary/20 dark:bg-primary/20 ">
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" >
                <Path opacity="0.4" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill={colorScheme == "light" ? theme.extend.colors.primary.DEFAULT : theme.extend.colors.primary[500]} />
                <Path d="M12 13.75C12.41 13.75 12.75 13.41 12.75 13V8C12.75 7.59 12.41 7.25 12 7.25C11.59 7.25 11.25 7.59 11.25 8V13C11.25 13.41 11.59 13.75 12 13.75Z" fill={colorScheme == "light" ? theme.extend.colors.primary.DEFAULT : theme.extend.colors.primary[500]} />
                <Path d="M12.92 15.6199C12.87 15.4999 12.8 15.3899 12.71 15.2899C12.61 15.1999 12.5 15.1299 12.38 15.0799C12.14 14.9799 11.86 14.9799 11.62 15.0799C11.5 15.1299 11.39 15.1999 11.29 15.2899C11.2 15.3899 11.13 15.4999 11.08 15.6199C11.03 15.7399 11 15.8699 11 15.9999C11 16.1299 11.03 16.2599 11.08 16.3799C11.13 16.5099 11.2 16.6099 11.29 16.7099C11.39 16.7999 11.5 16.8699 11.62 16.9199C11.74 16.9699 11.87 16.9999 12 16.9999C12.13 16.9999 12.26 16.9699 12.38 16.9199C12.5 16.8699 12.61 16.7999 12.71 16.7099C12.8 16.6099 12.87 16.5099 12.92 16.3799C12.97 16.2599 13 16.1299 13 15.9999C13 15.8699 12.97 15.7399 12.92 15.6199Z" fill={colorScheme == "light" ? theme.extend.colors.primary.DEFAULT : theme.extend.colors.primary[500]} />
            </Svg>
            <View className="flex-1 gap-y-">
                {
                    title && (
                        <Text className="text-[14px] font-jakarta-semibold text-primary-500 dark:text-primary-100">{title}</Text>
                    )
                }
                {
                    description&&<Text className="text-[12px] font-jakarta text-primary-500 dark:text-primary-100">{description}</Text>
                }
                
            </View>
        </View>
    )
}