'use client'
import { useState } from "react"
import DOMPurify from "dompurify"

interface ProductDescriptionProps {
    description: string,
    chars: {
        id: number,
        name: string,
        value: string
    }[]
}

const ProductInfo = ({ description, chars }: ProductDescriptionProps) => {

    const [active, setActive] = useState(description ? 'description' : chars ? "specification" : null);

    const htmlString = description
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&amp;', '&')
        .replaceAll('&quot;', '"')
        .replaceAll('&amp;nbsp;', '\n \n')
        .replaceAll('class;', 'className')

    const sanitizedData = () => ({
        __html: DOMPurify.sanitize(htmlString)
    })

    return (
        <section>
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px text-base xs:text-lg sm:text-xl md:text-2xl" id="myTab" data-tabs-toggle="#myTabContent" role="tablist">
                    {description && <li className="mr-2" role="presentation">
                        <button className={`inline-block py-4 px-4 font-medium lg:font-semibold text-center rounded-t-lg border-b-2 md:border-b-4 ${active === "description" ? "border-gray-300 text-black " : "border-transparent text-gray-500"} hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300`} id="description-tab" data-tabs-target="#Description" type="button" role="tab" aria-controls="Description" aria-selected={active === "description"}
                            onClick={() => setActive("description")}>Περιγραφή</button>
                    </li>}
                    <li className="mr-2" role="presentation">
                        <button className={`inline-block py-4 px-4 font-medium lg:font-semibold text-center rounded-t-lg border-b-2 md:border-b-4 ${active === "specification" ? "border-gray-300 text-black" : "border-transparent text-gray-500"} hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300`} id="specification-tab" data-tabs-target="#Specification" type="button" role="tab" aria-controls="Specification" aria-selected={active === "specification"}
                            onClick={() => setActive("specification")}>Χαρακτηριστικά</button>
                    </li>
                </ul>
            </div>
            <div id="myTabContent">
                {description && active === "description" ?
                    <div className="py-4 bg-gray-50 rounded-lg dark:bg-gray-800" id="description" role="tabpanel" aria-labelledby="description-tab">
                        <p className="text-sm xs:text-base md:text-lg text-gray-500 dark:text-gray-400 px-4" dangerouslySetInnerHTML={sanitizedData()}></p>
                    </div> :
                    <div className="py-4 rounded-lg dark:bg-gray-800" id="specification" role="tabpanel" aria-labelledby="specification-tab">
                        <table className="table-auto w-full">
                            <tbody>
                                {chars.map((char) => (
                                    <tr key={char.id} className="text-left w-full border text-sm">
                                        <th className="font-normal sm:w-52 w-36 py-2 px-4 bg-slate-100">{char.name}</th>
                                        <th className="text-slate-600 py-2 px-4 font-normal">{char.value}</th>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>}
            </div>
        </section>
    )
}

export default ProductInfo