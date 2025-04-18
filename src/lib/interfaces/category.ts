import { IImageAttr, Timage } from "./image"
import { IProdChar, IProductBrand, IProductCategory } from "./product"

interface IcategoryProductsAttr {
    name: string
    slug: string
    weight: number
    price: number
    sale_price: number
    is_sale: boolean
    inventory: number
    is_in_house: boolean
}

export type IcategoryProductsProps = {
    id: number
    attributes: IcategoryProductsAttr
    & IProdChar
    & IProductBrand
    & Timage
    & IProductCategory
}

export interface IcategoryProps {
    categories: {
        data: {
            attributes: {
                name: string
                slug: string
                categories: {
                    data: {
                        attributes: {
                            name: string
                            slug: string
                            categories: {
                                data: {
                                    attributes: {
                                        name: string
                                        slug: string
                                    }
                                }[]
                            }
                        }
                    }[]
                }
            }
        }[]
    }
}

export interface IcategoryFilterValuesProps {
    products: {
        data: {
            attributes: IProductBrand & IProdChar[]
        }[]
    }
}

export interface IMenuSub2CategoryProps {
    data: {
        attributes: {
            name: string
            slug: string
            image: { data: IImageAttr }
        }
    }[]
}

export interface IMenuSubCategoryProps {
    data: {
        attributes: {
            name: string
            slug: string
            image: { data: IImageAttr }
            categories: IMenuSub2CategoryProps
        }
    }[]
}

export interface IMenuProps {
    categories: {
        data: {
            attributes: {
                name: string
                slug: string
                image: { data: IImageAttr }
                categories: IMenuSubCategoryProps
            }
        }[]
    }
}

export interface IcategoryFiltersProps {
    categories: {
        data: {
            attributes: {
                filters: {
                    name: string
                }[]
            }
        }[]
    }
}

export interface IcategoryNameProps {
    categories: {
        data: {
            attributes: {
                name: string
                slug: string
            }
        }[]
    }
}

export interface IcategoryMetadataProps {
    categories: {
        data: [{
            attributes: {
                name: string
                slug: string
                image: { data: IImageAttr }
                categories: {
                    data: {
                        attributes: {
                            name: string
                        }
                    }[]
                }
            }
        }]
    }
}

export interface IcategoryChildsProps {
    categories: {
        data: {
            attributes: {
                name: string
                slug: string
                categories: {
                    data: {
                        attributes: {
                            name: string
                            slug: string
                            categories: {
                                data: {
                                    attributes: {
                                        name: string
                                        slug: string
                                    }
                                }[]
                            }
                        }
                    }[]
                }
            }
        }[]
    }
}

export interface IcategoriesMappingProps {
    categories: {
        data: {
            attributes: {
                name: string
                slug: string
                categories: {
                    data: {
                        attributes: {
                            name: string
                            slug: string
                            categories: {
                                data: {
                                    attributes: {
                                        name: string
                                        slug: string
                                    }
                                }[]
                            }
                        }
                    }[]
                }
            }
        }[]
    }
}