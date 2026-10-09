import { useContext } from "react";
import { DatasetContext, type DatasetContextType } from "../context/DatasetContext";

export function useDataset(): DatasetContextType {
    const context = useContext(DatasetContext);
    if (!context) {
        throw new Error("useDataset must be used within a DatasetProvider");
    }
    return context;
}
