export interface LabResultResponse {
    id: number;
    labTestId: number;
    resultValue: string;
    unit: string;
    referenceRange: string;
    isAbnormal: boolean;
    notes: string;
    recordedBy: string;
    fee: number;
    recordedAt: string;
}