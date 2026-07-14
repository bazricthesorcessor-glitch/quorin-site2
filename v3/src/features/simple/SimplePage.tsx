import { ArrowLeft } from "lucide-react";
import { MobileDock } from "../../components/navigation/MobileDock";
import { SiteHeader } from "../../components/navigation/SiteHeader";
import "./simple.css";
export function SimplePage({title,copy}:{title:string;copy:string}){return <div className="simple-page"><SiteHeader/><main className="q-container simple"><a href="/"><ArrowLeft size={17}/> Home</a><p>QUORIN</p><h1 className="q-display">{title}</h1><span>{copy}</span></main><MobileDock/></div>}
