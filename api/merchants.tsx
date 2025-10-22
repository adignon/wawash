import { handleAxiosResponseEror } from "@/helpler"
import { IPayment, IPaymentAccount } from "@/store/type"
import axios from "axios"

interface IOrderEval {
    orderId: string | number,
    kg: number
}
export async function orderEval(data: IOrderEval) {
    try {
        const { data: result } = await axios.post("/merchants/order/eval", data)
        return result
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }
}
export async function confirmCommand(data: Partial<IOrderEval>) {
    try {
        const { data: result } = await axios.post("/merchants/order/accept", data)
        return result
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }
}

interface IOrderAction {
    action: "WASHED" | "REJECTED",
    orderId: number
}
export async function submitAction(data: Partial<IOrderAction>) {
    try {
        const { data: result } = await axios.post("/merchants/order/submit", data)
        return result
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }
}


export async function confirmDelivery(data: Partial<IOrderAction>) {
    try {
        const { data: result } = await axios.post("/orders/" + data.orderId + "/delivered", data)
        return result
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }
}

export async function getMerchant(): Promise<{
    balance: number,
    serviceFeeRate: number,
    accounts: IPaymentAccount[],
    payments:IPayment[]
}> {
    try {
        const { data: result } = await axios.get("/merchants/balance/me")
        return result
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }
}

export async function addOrEditAdress(data: any) {
    try {
        const { data: result } = await axios.post("/merchants/checkout/adresses", data)
        return result
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }
}

export async function getPaymentMethods() {
    try {
        const { data: result } = await axios.get("/merchants/payments/methods")
        return result
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }
}


export async function getAddress() {
    try {
        const { data: result } = await axios.get("/merchants/checkout/adresses")
        return result
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }
}
interface IWithdraw {
    amoutToSend: number,
    amout: number,
    addressId: number | string,
    id:number

}
export async function withdrawFunds(data: Partial<IWithdraw>):Promise<IPayment> {
    if(data.id){
        return await getPayment({id:data.id})
    }
    try {
        const { data: result } = await axios.post("/merchants/payments/withdraw", data)
        return result
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }
}

export async function getPayment(data: Partial<IPayment>):Promise<IPayment> {
    try {
        const { data: result } = await axios.get("/merchants/payments/"+data.id)
        return result
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }
}

export async function getStatistics():Promise<{
    commandTotal:number,
    totalKg:number,
    incomes:number
}> {
    try {
        const { data: result } = await axios.get("/merchants/statistics")
        return result
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }
}