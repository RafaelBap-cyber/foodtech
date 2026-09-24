import { Request, Response } from "express";
import {
  listarOngs,
  buscarOngPorId,
  cadastrarOng,
  atualizarOng,
} from "../services/ongService";

export function listar(req: Request, res: Response) {
  const alimento = req.query.alimento as string | undefined;
  res.json(listarOngs(alimento));
}

export function buscar(req: Request, res: Response) {
  const ong = buscarOngPorId(Number(req.params.id));
  if (!ong) {
    return res.status(404).json({ mensagem: "ONG não encontrada" });
  }
  res.json(ong);
}

export function cadastrar(req: Request, res: Response) {
  const { nome, email, senha, telefone, endereco } = req.body;
  if (!nome || !email || !senha || !telefone || !endereco) {
    return res.status(400).json({ mensagem: "Preencha todos os campos obrigatórios" });
  }
  const nova = cadastrarOng(req.body);
  res.status(201).json(nova);
}

export function atualizar(req: Request, res: Response) {
  const ong = atualizarOng(Number(req.params.id), req.body);
  if (!ong) {
    return res.status(404).json({ mensagem: "ONG não encontrada" });
  }
  res.json(ong);
}