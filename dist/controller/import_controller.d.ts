import { Request, Response } from 'express';
declare class ImportController {
    getAllImports(req: Request, res: Response): Promise<void>;
    getImportById(req: Request, res: Response): Promise<void>;
    createImport(req: Request, res: Response): Promise<void>;
    updateImport(req: Request, res: Response): Promise<void>;
    deleteImport(req: Request, res: Response): Promise<void>;
}
declare const _default: ImportController;
export default _default;
//# sourceMappingURL=import_controller.d.ts.map