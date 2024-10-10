export class HeatingCurves {
    Afloor: number;
    UaBui: number;
    TambDesign: number;
    floorHeating: boolean;

    constructor(Afloor: number, UaBui: number, TambDesign: number) {
        this.floorHeating = false; // Use boolean type for true/false
        this.Afloor = Afloor;
        this.UaBui = UaBui;
        this.TambDesign = TambDesign;
    }

    // Calculate the design space heat load (QDesign)
    getDesignSpaceHeatLoad(): number {
        const QDesign = this.UaBui * (20 - this.TambDesign); // Assume 20°C indoor temperature
        return QDesign;
    }

    // Calculate heating power of radiators at 75/65/20
    getQRad75to65(): number {
        const noOfRad = 14; // Total number of radiators (m length)
        const pPerRad = 1400; // W per meter based on Recknagel-Sprenger values
        const QRad = noOfRad * pPerRad; // Total heating power of radiators
        return QRad; // in Watts
    }

    // Calculate heating power of the floor at 45/35/20 for wood surface
    getQFloor45to35(): number {
        const Qfloor = 61 * this.Afloor; // 61 W/m² for wood flooring
        return Qfloor;
    }

    // Calculate the nominal supply temperature based on the heating system (floor/radiators)
    getTSupplyNom(): number {
        let TSupplyNom: number;

        if (this.floorHeating) {
            const tFloorDesign = 20 + 20 * Math.pow(this.getDesignSpaceHeatLoad() / this.getQFloor45to35(), 1 / 1.1);
            TSupplyNom = tFloorDesign + (this.getDesignSpaceHeatLoad() / this.getQFloor45to35()) * 5;
        } else {
            const tRadDesign = 20 + 50 * Math.pow(this.getDesignSpaceHeatLoad() / this.getQRad75to65(), 1 / 1.3);
            TSupplyNom = tRadDesign + (this.getDesignSpaceHeatLoad() / this.getQRad75to65()) * 5;
        }

        return TSupplyNom;
    }

    // Calculate the flow temperature setpoint of the heating system
    getTSupply(
        taN: number, // Nominal ambient temperature (°C)
        trSet: number, // Room set point temperature (°C)
        tflN: number, // Nominal flow temperature of the heating system (°C)
        ta: number, // Actual ambient temperature (°C)
        floorHeating: boolean // Whether floor heating is used
    ): number {
        let n: number;
        let tsupply: number;

        // Choose exponent based on the heating system type
        if (floorHeating) {
            n = 1.1; // Floor heating exponent
        } else {
            n = 1.3; // Radiators exponent
        }

        // Calculate the flow temperature setpoint
        tsupply = trSet + (tflN - trSet) * Math.pow(Math.max(trSet - ta, 0) / (trSet - taN), 1 / n);

        return tsupply;
    }
}
