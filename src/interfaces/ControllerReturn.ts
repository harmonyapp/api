import { Response } from "express";

export type ControllerReturn = Response<unknown> | void;
export type ControllerReturnPromise = Promise<ControllerReturn>;