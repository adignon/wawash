import { handleAxiosResponseEror } from "@/helpler";
import { Addons, ICommand, IOrder } from "@/store/type";
import axios from "axios";

export async function getPackages(params?: { type: string }) {
    try {
        const { data } = await axios.get("/packages/" + (params?.type ?? ''))
        return data
    } catch (e) {
        console.log(e)
        throw handleAxiosResponseEror(e)
    }
}


export async function saveAdress(requestData: any) {
    try {
        const { data } = await axios.post("/address", requestData)

        return data
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }
}


export async function getAdress() {
    try {
        const { data } = await axios.get("/address")

        return data
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }
}


export async function getPackagesAddons(): Promise<Addons> {
    try {
        const { data } = await axios.get("/packages/addons")
        return data
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }
}
interface ISubscribe {
    id?: number
    packageId: string,
    prefereredShipping: string,
    weekDayPicking: any,
    dryingAddon: boolean,
    autoRenew: boolean,
    retry?: boolean,
    hours?:any
}
export async function subscribe(requestData: Partial<ISubscribe>): Promise<ICommand> {
    if (requestData.id) {
        return await verifyTransaction({ subscriptionId: requestData.id, retry: !!requestData.retry })
    } else {
        try {
            const { data } = await axios.post("/packages/subscribe", requestData)
            return data
        } catch (e) {
            throw handleAxiosResponseEror(e)
        }
    }

}

export async function command(requestData: Partial<ISubscribe&{pickingDate:string}>): Promise<IOrder> {

    try {
        const { data } = await axios.post("/packages/command", requestData)
        return data
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }


}

export async function cancelActiveSubscription(): Promise<Addons> {
    try {
        const { data } = await axios.post("/subscription/cancel")
        return data
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }

}

export async function verifyTransaction(request: { subscriptionId: number, retry: boolean }) {
    try {

        const { data } = await axios.get("/subscription/payment/" + request.subscriptionId, {
            params: {
                retry: Number(request.retry)
            }
        })
        return data
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }
}

export async function getHistories(): Promise<Addons> {
    try {
        const { data } = await axios.get("/histories")
        return data
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }

}

export async function getOrder(id: string): Promise<Addons> {
    try {
        const { data } = await axios.get("/orders/" + id)
        return data
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }

}
interface IPayInvoice{
    orderId:string|number
}
export async function payInvoice(requestData: IPayInvoice): Promise<{
    order:IOrder,
    paymentUrl?:string
}> {

    try {
        const { data } = await axios.post("/packages/command/pay/"+requestData.orderId)
        return data
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }


}

