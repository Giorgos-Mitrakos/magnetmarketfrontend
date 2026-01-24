'use client'
import { useState, useEffect } from "react"
import './ProductInfo.css'

interface ProductInfoClientProps {
    description: string | null,
    chars?: {
        id: number,
        name: string,
        value: string
    }[]
}

const ProductInfoClient = ({ description, chars }: ProductInfoClientProps) => {
    const [active, setActive] = useState(
        description ? 'description' : 
        chars && chars.length > 0 ? 'specification' : 
        null
    );
    const [sanitizedHTML, setSanitizedHTML] = useState<string>('');

    useEffect(() => {
        if (description && typeof window !== 'undefined') {
            // Decode HTML entities
            const textarea = document.createElement('textarea');
            textarea.innerHTML = description;
            const decodedHTML = textarea.value;
            
            import('dompurify').then((DOMPurify) => {
                const config = {
                    ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'u', 'p', 'br', 'ul', 'ol', 'li', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'a', 'div', 'span'],
                    ALLOWED_ATTR: ['class', 'src', 'href', 'alt', 'title', 'width', 'height'],
                    KEEP_CONTENT: true,
                };
                
                const cleaned = DOMPurify.default.sanitize(decodedHTML, config);
                setSanitizedHTML(cleaned);
            });
        }
    }, [description]);

    return (
        <section className="w-full">
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px" role="tablist">
                    {description && (
                        <li className="mr-2" role="presentation">
                            <button 
                                className={`inline-block py-3 px-6 text-lg font-medium text-center rounded-t-lg border-b-2 transition-colors ${active === "description" 
                                    ? "border-siteColors-blue text-siteColors-blue dark:text-siteColors-lightblue dark:border-siteColors-lightblue" 
                                    : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`} 
                                type="button" 
                                role="tab" 
                                aria-controls="Description" 
                                aria-selected={active === "description"}
                                onClick={() => setActive("description")}
                            >
                                Περιγραφή
                            </button>
                        </li>
                    )}
                    {chars && chars.length > 0 && (
                        <li className="mr-2" role="presentation">
                            <button 
                                className={`inline-block py-3 px-6 text-lg font-medium text-center rounded-t-lg border-b-2 transition-colors ${active === "specification" 
                                    ? "border-siteColors-blue text-siteColors-blue dark:text-siteColors-lightblue dark:border-siteColors-lightblue" 
                                    : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`} 
                                type="button" 
                                role="tab" 
                                aria-controls="Specification" 
                                aria-selected={active === "specification"}
                                onClick={() => setActive("specification")}
                            >
                                Χαρακτηριστικά
                            </button>
                        </li>
                    )}
                </ul>
            </div>
            
            <div>
                {description && active === "description" && (
                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg" role="tabpanel">
                        <div 
                            dangerouslySetInnerHTML={{ __html: sanitizedHTML }} 
                            className="product-description"
                        />
                    </div>
                )}
                
                {chars && chars.length > 0 && active === "specification" && (
                    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden" role="tabpanel">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {chars.map((char, index) => (
                                <div 
                                    key={char.id} 
                                    className={`flex p-4 ${index % 2 === 0 ? 'md:border-r border-gray-100 dark:border-gray-600' : ''} ${index < chars.length - (chars.length % 2 === 0 ? 0 : 1) ? 'border-b border-gray-100 dark:border-gray-600' : ''}`}
                                >
                                    <div className="w-1/3 md:w-2/5 mr-2 font-medium text-gray-700 dark:text-gray-300">
                                        {char.name}
                                    </div>
                                    <div className="w-2/3 md:w-3/5 text-gray-600 dark:text-gray-200">
                                        {char.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default ProductInfoClient