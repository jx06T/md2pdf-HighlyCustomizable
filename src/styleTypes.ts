

// Types
interface FontConfig {
    size: number;
    weight: string;
    familyC?: string;
    familyE?: string;
    height?: number;
    color?: string;
    Dcolor?: string;
}

interface HeaderConfig {
    alignment?: string,
    size: number;
    weight: string;
    tMargin: number,
    bMargin: number,
    decorativeSymbol?: string;
    scaling: number;
    underline?: string;
    udlColor?: string;
    color: string;
}

interface ListConfig {
    scaling1: number;
    scaling2: number;
    scaling3: number;
    scaling4: number;
    scaling5: number;
    decorativeSymbol1: string;
    decorativeSymbol2: string;
    decorativeSymbol3: string;
    decorativeSymbol4: string;
    decorativeSymbol5: string;
}

interface ImageAnnotationConfig {
    size: number;
    weight: string;
    decorativeSymbol?: string;
    color: string;
}

interface ImageConfig {
    radius: number;
    alignment: 'left' | 'center' | 'right';
    annotation: ImageAnnotationConfig;
    tMargin: number,
    bMargin: number,
    height: number,
}

interface BlockquotesConfig {
    titleMargin: number;
    textScaling: number;
    scaling: number;
    color: string;
    bgColor: string;
    contentMargin: number,
    tMargin: number,
    bMargin: number,
    font: FontConfig;
}

interface PageConfig {
    font: FontConfig;
    layout: {
        bgColor: string;
        pageNumber: boolean;
        author: string;
        title: string;
        orientation: 'portrait' | 'landscape';
        tBoundary: number
        tPadding?: number
        bBoundary: number
        lBoundary: number
        rBoundary: number
    };
}
interface HeaderNumberConfig {
    minDepth: number,
    maxDepth: number,
    style: string,
    separator: string
}
interface StyleConfig {
    init?: boolean;
    headerNumber: HeaderNumberConfig,
    page: PageConfig;
    title: {
        H1: HeaderConfig;
        H2: HeaderConfig;
        H3: HeaderConfig;
        H4: HeaderConfig;
        H5: HeaderConfig;
        H6: HeaderConfig;
    };
    list: {
        orderedLists: ListConfig;
        unorderedList: ListConfig;
        task: {
            scaling: number;
        },
    };
    code: {
        inlineColor: string,
        bgColor: string,
        tMargin: number,
        bMargin: number,
        theme: string
    };
    table: {
        titleColor: string,
        color1: string,
        color2: string,
        lineColor: string,
        textAlignment: 'left' | 'center' | 'right';
        tMargin: number,
        bMargin: number,
    };
    image: ImageConfig;
    blockquotes: BlockquotesConfig;
}


export type {
    StyleConfig,
    PageConfig,
    HeaderConfig,
    HeaderNumberConfig,
    ListConfig,
    ImageConfig,
    BlockquotesConfig,
    FontConfig,
};
