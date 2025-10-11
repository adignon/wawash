import { handleAxiosResponseEror } from "@/helpler"
import axios from "axios"

interface IOrderEval{
    orderId:string,
    kg:number
}
export async function orderEval(data:IOrderEval){
    try{
        const{data:result}=await axios.post("/merchants/order/eval", data)
        return result
    }catch(e){
        throw handleAxiosResponseEror(e)
    }
}