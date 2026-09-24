import { Router } from "express";
import { listar, buscar, cadastrar, atualizar } from "../controllers/ongController";

const router = Router();

router.get("/", listar);          // GET /ongs?alimento=arroz
router.get("/:id", buscar);       // GET /ongs/1
router.post("/", cadastrar);      // POST /ongs
router.put("/:id", atualizar);    // PUT /ongs/1

export default router;