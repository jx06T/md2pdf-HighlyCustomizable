

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

interface StyleConfig {
    init?: boolean;
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

// Default values
const defaultStyleConfig: StyleConfig = {
    init: true,
    page: {
        font: {
            size: 18,
            weight: "normal",
            familyC: '"Microsoft JhengHei", sans-serif',
            familyE: '"Microsoft JhengHei", sans-serif',
            height: 31,
            color: '#000000',
            Dcolor: '#444444'
        },
        layout: {
            bgColor: '#ffffff',
            pageNumber: true,
            author: '',
            title: '',
            orientation: 'portrait',
            tPadding: 0,
            tBoundary: 10,
            bBoundary: 15,
            lBoundary: 10,
            rBoundary: 10
        }
    },
    title: {
        H1: {
            size: 32,
            weight: "bold",
            tMargin: 13,
            bMargin: 7,
            decorativeSymbol: '',
            scaling: 0,
            underline: "underline",
            color: '#000000',
            udlColor: "#474747",
            alignment: 'center',
        },
        H2: {
            size: 24,
            weight: "bold",
            tMargin: 9,
            bMargin: 7,
            decorativeSymbol: '',
            scaling: 0,
            underline: "underline",
            color: '#000000',
            udlColor: "#5e5e5e"
        },
        H3: {
            size: 20,
            weight: "bold",
            tMargin: 7,
            bMargin: 0,
            decorativeSymbol: '',
            scaling: 0,
            underline: "",
            color: '#000000',
            udlColor: "#5e5e5e"
        },
        H4: {
            size: 20,
            weight: "normal",
            tMargin: 3,
            bMargin: 0,
            decorativeSymbol: '',
            scaling: 0,
            color: '#000000',
            udlColor: "#5e5e5e"
        },
        H5: {
            size: 16,
            weight: "normal",
            tMargin: 0,
            bMargin: 0,
            decorativeSymbol: '',
            scaling: 0,
            color: '#3f4a58',
            udlColor: "#5e5e5e"
        },
        H6: {
            size: 14,
            weight: "normal",
            tMargin: 0,
            bMargin: 0,
            decorativeSymbol: '',
            scaling: 0,
            color: '#475569',
            udlColor: "#5e5e5e"
        }
    },
    list: {
        orderedLists: {
            scaling1: 36,
            scaling2: 20,
            scaling3: 20,
            scaling4: 20,
            scaling5: 20,
            decorativeSymbol1: 'decimal',
            decorativeSymbol2: 'decimal',
            decorativeSymbol3: 'decimal',
            decorativeSymbol4: 'decimal',
            decorativeSymbol5: 'decimal'
        },
        unorderedList: {
            scaling1: 35,
            scaling2: 20,
            scaling3: 20,
            scaling4: 20,
            scaling5: 20,
            decorativeSymbol1: 'disc',
            decorativeSymbol2: 'circle',
            decorativeSymbol3: 'circle',
            decorativeSymbol4: 'circle',
            decorativeSymbol5: 'circle'
        },
        task: {
            scaling: 18,
        }
    },
    image: {
        radius: 5,
        alignment: 'center',
        tMargin: 8,
        bMargin: 16,
        height: 370,
        annotation: {
            size: 14,
            weight: "normal",
            decorativeSymbol: '',
            color: '#666666'
        }
    },
    blockquotes: {
        textScaling: 20,
        contentMargin: -10,
        titleMargin: 15,
        scaling: 10,
        color: '#c3c6cb',
        bgColor: '#ffffff',
        tMargin: 20,
        bMargin: 20,
        font: {
            size: 16,
            weight: "normal"
        }
    },
    code: {
        inlineColor: '#ebebeb',
        bgColor: '#1e1e1e',
        tMargin: 10,
        bMargin: 10,
        theme: 'dark'
    },
    table: {
        titleColor: '#f4f4f4',
        color1: '#FFFFFF',
        color2: '#f9f9f9',
        lineColor: '#dddddd',
        textAlignment: 'center',
        tMargin: 20,
        bMargin: 10,
    }
};

export type {
    StyleConfig,
    PageConfig,
    HeaderConfig,
    ListConfig,
    ImageConfig,
    BlockquotesConfig,
    FontConfig,
};

export { defaultStyleConfig };