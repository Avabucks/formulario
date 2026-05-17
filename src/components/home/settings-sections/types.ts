export type Formulario = {
    titolo: string
    descrizione: string
    nomeAutore: string
    photoURL: string
    dataCreazione: string
    visibility: 0 | 1 | 2
    views: number
    likes: number
    starred: boolean
    editable: boolean
}

export type SettingsSection = "info" | "edit" | "structure" | "qr"

export type StructureArgomento = {
    id: string
    titolo: string
    empty: boolean
    sortOrder: number
}

export type StructureCapitolo = {
    id: string
    titolo: string
    sortOrder: number
    argomenti: StructureArgomento[]
}

export type FormularioStructure = {
    capitoli: StructureCapitolo[]
    stats: {
        capitoliCount: number
        argomentiCount: number
        emptyCapitoliCount: number
        emptyArgomentiCount: number
        untitledArgomentiCount: number
    }
}
