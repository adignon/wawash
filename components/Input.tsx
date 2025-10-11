import { clx } from "@/helpler";
import { useThemeValue } from "@/hooks/useThemeValue";
import { country } from "@/storage/config";
import { theme } from "@/tailwind.config";
import { BottomSheetFlatList, BottomSheetModal, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { t } from "i18next";
import parsePhoneNumberFromString from "libphonenumber-js";
import { } from "nativewind";
import React, { ComponentProps, useCallback, useMemo, useRef } from "react";
import { TextInput, TextInputProps, TextProps, TouchableOpacity, View, ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Text } from "./Themed";
interface IInput extends TextInputProps {
    left?: React.ReactNode,
    right?: React.ReactNode,
    label?: React.ReactNode | string,
    isValid?: boolean,
    error?: string,
    searchableComponent?: React.ReactElement<ComponentProps<typeof SearchableList>>
}
export function Input({
    error,
    isValid,
    searchableComponent,
    left,
    right,
    label,
    ...rest
}: IInput) {
    const { className: inputClassName, ...props } = rest ?? {}
    const Input = (
        <>
            <View className={clx("flex-row items-center rounded-[15px] border border-dark-300", error && typeof isValid == "boolean" ? {
                "border-red-400 border-2": !isValid,
                "border-green border-2": isValid
            } : "")}>
                {left ?? <></>}
                <TextInput className={clx("flex-1 p-4 p-4 text-[16px] font-jakarta-medium text-dark-text  placeholder:text-dark-300 dark:text-white ", error && typeof isValid == "boolean" ? {
                    "text-red-400": !isValid,
                    "text-green": isValid
                } : "", inputClassName)}  {...props} />
                {right ?? <></>}
            </View>
            {searchableComponent ? React.cloneElement(searchableComponent, {
                value: props.value,
                onChangeText: props.onChangeText
            }) : <></>}
            {
                error && typeof isValid == "boolean" && !isValid && error && (
                    <View className="-mt-2">
                        <Text className={clx("text-[12px] font-jakarta ", 'text-red-400 dark:text-red-400')}>{t(error)}</Text>
                    </View>
                )
            }

        </>
    )
    if (label) {
        return <View className="gap-y-2">
            <View className="px-2">
                {typeof label == "string" ? <InputLabel title={label} /> : label}
            </View>
            {Input}
        </View>
    }
    return (
        Input
    )
}
interface IInputPhoneNumber extends IInput {

}
export function InputPhoneNumber({ ...props }: IInputPhoneNumber) {
    const formatedPhone = React.useRef(parsePhoneNumberFromString(props.value ?? '', country.code as any)?.formatNational()!)
    const handleChangeText = (text: string) => {
        if (/[0-9\s]/.test(text)) {
            props.onChangeText?.(text)
            formatedPhone.current = parsePhoneNumberFromString(text, country.code as any)?.formatNational()!
        }
    }

    return (
        <Input
            left={
                <View className="pl-4 justify-center">
                    <View className="w-[30px]  h-[20px] rounded-[5px] overflow-hidden ">
                        <Image
                            source={require("@/storage/countries/4x3/bj.svg")}
                            style={{
                                width: 35,
                                marginLeft: -5,
                                height: 19,
                                objectFit: "cover",
                            }}
                        />
                    </View>
                </View>
            }
            keyboardType="phone-pad"
            {...props}
            value={formatedPhone.current}
            onChangeText={handleChangeText}
        />
    )
}
interface IInputLabel extends TextProps {
    title: string
}
export function InputLabel({ title, className, ...props }: IInputLabel) {
    return (
        <Text className={clx("dark:text-gray-400 text-dark-400 text-[12px] font-jakarta-semibold", className)} {...props}> {title}</Text>
    )
}

interface ISeachable extends ViewProps {
    show?: boolean,
    data: any[],
    value?: string,
    onSearch?: (data: any[], value: string) => any[],
    onChangeText?: (t: string) => void,
    renderItem: (t: any, i: number) => React.ReactNode
}
export function SearchableList({ show, data, value, onChangeText, renderItem, onSearch }: ISeachable) {
    const filteredData = useMemo(() => value ? (onSearch ? onSearch(data, value).slice(0, 3) : []) : [], [value])
    return (
        <View>
            {
                filteredData.length && show ?
                    <View className="absolute w-full bg-white dark:bg-dark-lighter rounded-[15px] z-10"
                        style={{
                            shadowColor: "#000000",
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.1,
                            shadowRadius: 10,
                            elevation: 2
                        }}
                    >
                        {
                            filteredData.map(renderItem)
                        }
                    </View>
                    :
                    <></>
            }

        </View>
    )
}
interface ISearchableInput extends IInput {
    data: ({ key: string, name: string })[],
    listTitle: string,
    listDescription?: string
}
export function SearchableInput({ data, listTitle, listDescription, ...props }: ISearchableInput & ISeachable) {
    const [text, setText] = React.useState("")
    const snapPoints = useMemo(() => ["50%", "90%"], []);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);
    const onSearch = useCallback(props.onSearch ?? ((data: any, value: string) => data.filter((d: any) => {
        return d.name.toLowerCase().includes(value.toLowerCase()) && d.name != value
    })), [props.onSearch])
    const handleSheetChanges = useCallback((index: number) => {
        if (index < 0) {
            setText("")
        }
    }, []);
    const [showList, setShowList] = React.useState(false)
    const filtered = useMemo(() => text.length ? onSearch(data, text) : data, [text, data])
    return (
        <>
            <Input
                searchableComponent={
                    <SearchableList
                        show={showList}
                        data={data}
                        value={props.value}
                        onSearch={onSearch}
                        renderItem={(t: any, i: number) => {
                            return <TouchableOpacity onPress={() => props.onChangeText?.(t.name)} key={t.key} className={clx("px-5 py-4 ", i > 0 && "border-t border-gray-200 dark:border-dark-border")}><Text className="font-jakarta-medium text-[14px] text-dark">{t.name}</Text></TouchableOpacity>
                        }}
                    />
                }
                right={
                    <View className="px-4">
                        <TouchableOpacity onPress={handlePresentModalPress} className="bg-primary/20 justify-center items-center w-[20px] h-[20px] rounded-full">
                            <Svg width="16" height="16" viewBox="0 0 16 16" fill="none" >
                                <Path d="M13.28 5.96667L8.9333 10.3133C8.41997 10.8267 7.57997 10.8267 7.06664 10.3133L2.71997 5.96667" stroke={theme.extend.colors.primary.DEFAULT} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </TouchableOpacity>
                    </View>
                }

                {...props}
                onBlur={(e) => {
                    props.onBlur?.(e)
                    if (showList) setShowList(false)
                }}
                onChangeText={(text) => {
                    props.onChangeText?.(text)
                    if (text.length && !showList) setShowList(true)
                }}
            />
            <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={snapPoints}
                enableDynamicSizing={false}
                onChange={handleSheetChanges}
                handleIndicatorStyle={{

                    backgroundColor: useThemeValue({
                        dark: theme.extend.colors.gray[200],
                        light: theme.extend.colors.dark.text
                    })
                }}
                backgroundStyle={{
                    backgroundColor: useThemeValue({
                        dark: theme.extend.colors.dark["dark-bg"],
                        light: '#fff'
                    })
                }}
                handleStyle={{
                    borderTopLeftRadius: 15,
                    borderTopRightRadius: 15,
                    backgroundColor: useThemeValue({
                        dark: theme.extend.colors.dark["dark-bg"],
                        light: '#fff'
                    }),
                }}
            >
                <View className="flex-1">
                    <View className="bg-white  dark:bg-dark-dark-bg">
                        <View className="px-4 pb-2 bg-white dark:bg-dark-dark-bg ">
                            <Text className="text-[20px] font-jakarta-semibold text-dark dark:text-gray-100">{listTitle}</Text>
                            {
                                listDescription ? (
                                    <Text className="text-[14px] font-jakarta text-dark-400 ">{listDescription}</Text>
                                ) : <></>
                            }
                        </View>
                        <View className="px-4 py-2">
                            <BottomSheetTextInput value={text} onChangeText={setText} placeholder={t("Rechercher...")} className="placeholder:dark:text-gray-300 placeholder:text-dark-300 font-jakarta text-[14px] dark:text-gray-100 dark:bg-dark-lighter text-dark bg-slate-200 p-4 rounded-[15px]" />
                        </View>
                        <BottomSheetFlatList
                            data={filtered}
                            keyExtractor={(d: any) => d.key}
                            renderItem={({ item, index }: any) => {
                                return <TouchableOpacity onPress={() => {
                                    props.onChangeText?.(item.name)
                                    bottomSheetModalRef?.current?.close()
                                }} key={item.key} className={clx(" px-5 py-4 ", index > 0 && "border-t border-gray-200 dark:border-t-dark-lighter ")}><Text className="font-jakarta-medium text-[14px] text-dark">{item.name}</Text></TouchableOpacity>
                            }}
                            contentContainerStyle={{


                            }}
                        />
                    </View>
                </View>

            </BottomSheetModal>
        </>

    )
}
interface ICheckbox {
    label: React.ReactNode,
    onCheck: (x: boolean) => void,
    check: boolean,
    disabled?:boolean
}
export function Checkbox({ label,disabled, check, onCheck }: ICheckbox) {
    return (
        <TouchableOpacity disabled={disabled} onPress={() => onCheck(!check)} className={clx("flex-row", disabled&&"opacity-20")}>
            <View className={clx("justify-center items-center w-[18px] h-[18px] rounded-[5px] ", check ? "bg-primary dark:bg-primary-500" : "border border-gray dark:border-dark-border")}>
                {
                    check && (
                        <Svg width="9" height="8" viewBox="0 0 9 8" fill="none" >
                            <Path d="M0.916667 5.16667L2.48309 6.34148C2.91178 6.663 3.51772 6.58946 3.85705 6.17472L8.5 0.5" stroke="white" strokeLinecap="round" />
                        </Svg>
                    )
                }
            </View>
            <View className="flex-1">
                {label}
            </View>
        </TouchableOpacity>
    )
}