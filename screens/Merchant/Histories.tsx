import { getHistories } from "@/api/subscription";
import { Header } from "@/components/Header";
import { useStore } from "@/store/store";
import { IOrder } from "@/store/type";
import { useQuery } from "@tanstack/react-query";
import { endOfWeek } from "date-fns";
import { t } from "i18next";
import React, { useMemo } from "react";
import { View } from "react-native";
import { FilterOptions, SectionHistories } from "../Client/Histories";

export function Histories() {
    const query = useQuery({
        queryKey: ["histories"],
        queryFn: getHistories
    })
    const user = useStore(s => s.user)
    const options = [
        {
            title: t("Commandes planifiées"),
            label: t("Planifiées"),
            id: "PLANNED",
            filter: (data: IOrder[]): IOrder[] => {
                return data.filter(d=>!["CANCELED","REJECTED"].includes(d.status) &&  endOfWeek(new Date) > new Date(d.executionDate))
            }
        },
        {
            title: t("Commandes annulées"),
            label: t("Annulées"),
            id: "CANCELED",
            filter: (data: IOrder[]): IOrder[] => {
                return data.filter(d=>d.status=="CANCELED")
            }
        },
        {
            title: t("Commandes rejetées"),
            label: t("Annulées"),
            id: "REJETED",
            filter: (data: IOrder[]): IOrder[] => {
                return data.filter(d=>d.status=="REJETED")
            }
        }
    ]
    const [selected, setSelected] = React.useState(options[0].id)
    const filter = useMemo(()=>{
        return options.find(o=>o.id==selected)
    },[selected])
    const orders = useMemo(() => {
        if (query.data && query.isSuccess) {
            return filter?.filter(query.data)
        }
        return []
    }, [query.data, filter])
    return (
        <View className="flex-1 bg-light dark:bg-dark-bg">
            <Header
                backButton=""
                title={t("Mes commandes")}
                right={
                    <FilterOptions options={options} state={[selected, setSelected]} />
                }
            />
            <View className="mt-8 flex-1">
                <SectionHistories query={query} user={user} orders={orders}/>
            </View>
        </View>
    )
}