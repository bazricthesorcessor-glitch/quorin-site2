export type CatalogProduct={id:string;name:string;description:string;price:number;mrp:number;image:string;category:string;featured?:boolean};
export const catalogProducts:CatalogProduct[]=[
{id:"resin",name:"QUORIN Epoxy Resin & Hardener",description:"Crystal clear two-part epoxy system for art and crafts.",price:677,mrp:1499,image:"/PHOTOS/Resin/1.webp",category:"Resin Art",featured:true},
{id:"resin-pigment",name:"QUORIN Resin Pigment",description:"Highly concentrated liquid colour for resin crafts.",price:112,mrp:249,image:"/PHOTOS/resin pigment/6/7.webp",category:"Resin Art"},
{id:"candle-pigment",name:"QUORIN Candle Pigment Set",description:"Vibrant concentrated colour for candle making.",price:156,mrp:349,image:"/PHOTOS/candle pigments/candle colour for canldle making (1).webp",category:"Candle Making",featured:true},
{id:"fragrance-oil",name:"QUORIN Fragrance Oil Collection",description:"Premium fragrance oils for candle making and aromatherapy.",price:224,mrp:499,image:"/PHOTOS/Fragrances/variation 1/1.webp",category:"Candle Making",featured:true},
{id:"soap-dye",name:"QUORIN Soap Pigment Set",description:"Beginner-friendly liquid soap pigments in vibrant colours.",price:315,mrp:699,image:"/PHOTOS/Soap dye/1.webp",category:"Soap Making"},
{id:"soap-kit",name:"QUORIN Soap Making Kit with Mould",description:"A complete starter set with pigments and silicone mould.",price:899,mrp:1799,image:"/PHOTOS/Soap Dye + mould/1.webp",category:"Soap Making",featured:true}
];
