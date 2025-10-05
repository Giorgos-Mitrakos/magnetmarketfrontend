export interface IFormatImageAttr {
    ext: string
    url: string
    hash: string
    mime: string
    name: string
    path: string
    size: number
    width: number
    height: number
    sizeInBytes: number
}

export interface IImageFormats {
    large: IFormatImageAttr
    small: IFormatImageAttr
    medium: IFormatImageAttr
    thumbnail: IFormatImageAttr
}

export interface IImageAttr {
    name: string
    alternativeText: string
    caption: string
    width: string
    height: string
    hash: string
    ext: string
    mime: string
    size: string
    url: string
    formats: IImageFormats
}

export type Timage = { image: { data: { attributes: IImageAttr } } }
export type TadditionalImages = { additionalImages: { data: IImageAttr[] } }