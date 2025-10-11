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
    title?: string|React.ReactNode,
    paddingBottom?:number
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
            onChange={(index, position, type)=>{
                if(index<0){
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
                }} className="rounded-t-[25px] bg-white dark:bg-dark-dark-bg">
                    <View className="p-4 px-4 flex-row items-center gap-x-4">
                        <TouchableOpacity onPress={onClose} className="rounded-full p-2 bg-gray-100 dark:bg-dark-400">
                            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <Path d="M15 5L5 15" stroke={colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[400]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <Path d="M5 5L15 15" stroke={colorScheme == "light" ? theme.extend.colors.gray.DEFAULT : theme.extend.colors.gray[400]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </TouchableOpacity>
                        {
                            typeof(title)=="string" ? (
                                <Text className="font-jakarta-semibold text-[18px] text-dark dark:text-white">{t(title)}</Text>
                            ): (title??<></>)
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
    const {bottom}=useSafeAreaInsets()
    return (
        <Modal
            transparent
            visible={show}
            onRequestClose={onClose}
            animationType="fade"
        >

            <View className="justify-end flex-1 bg-dark/20">
                <View style={{
                    paddingBottom:bottom
                }} className="rounded-t-[25px] bg-white dark:bg-dark-lighter">
                    <View className="p-4 px-4 flex-row items-center gap-x-4">
                        <TouchableOpacity onPress={onClose} className="rounded-full p-2 bg-gray-100 dark:bg-dark-400">
                            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <Path d="M15 5L5 15" stroke={colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[400]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <Path d="M5 5L15 15" stroke={colorScheme == "light" ? theme.extend.colors.gray.DEFAULT : theme.extend.colors.gray[400]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </TouchableOpacity>
                        {
                            typeof(title)=="string" ? (
                                <Text className="font-jakarta-semibold text-[18px] text-dark dark:text-white">{t(title)}</Text>
                            ): (title??<></>)
                        }
                    </View>
                    <View className="p-4">{children}</View>
                </View>
            </View>
        </Modal>
    )
}