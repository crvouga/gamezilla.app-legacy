import { useEffect, useState } from "react";

type ISubsrcriptionState<TData> = 
  {
    status: "loading"
  } |
  {
    status: "success"
    data: TData
  }

type ISubscribe<TData> =(set: (data: TData) => void) => () => void

export const useSubscription = <TData>(subscribe: ISubscribe<TData>) => {
  const [state, setState]= useState<ISubsrcriptionState<TData>>({status: "loading"});

  useEffect(() => {
    const unsubscribe = subscribe(data=> {
      setState({status: "success", data})
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return state;
};
