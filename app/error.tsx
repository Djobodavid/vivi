"use client"
import Link from "next/link";

export default function Error(){

    return <div>
        <h2>Erreur</h2>
        <p>message erreur a definir</p>
        <Link href={"/"} >Reéssayer</Link>
    </div>
}