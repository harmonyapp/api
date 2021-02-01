import { Response, Request, NextFunction } from "express";
import config from "../../../../../config/config";
import BaseController from "../BaseController";
import Application from "../../../../models/application";
import GenericError from "../../../../errors/GenericError";
import { ControllerReturnPromise } from "../../../../interfaces/ControllerReturn";
import HttpStatusCode from "../../../../interfaces/HttpStatusCode";

class ApplicationsController extends BaseController {
    public static async getApplications(req: Request, res: Response): ControllerReturnPromise {
        const applications = await Application.find({ user: req.user.id }).sort("-createdAt");

        return res.send({ applications });
    }

    public static async getApplicationByID(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const application = await Application.findOne({ _id: req.params.id, user: req.user.id });

        if (!application) {
            return next(new GenericError("Application not found").setHttpStatusCode(HttpStatusCode.NOT_FOUND));
        }

        return res.send({ application });
    }

    public static async createApplication(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const existingApplications = await Application.countDocuments({ user: req.user.id });
        const maxApplications = config.has("maxApplications") ? config.get("maxApplications") : -1;

        if (maxApplications !== -1 && existingApplications >= maxApplications) {
            return next(
                new GenericError("You can't have more than " + maxApplications + " applications")
                    .setHttpStatusCode(HttpStatusCode.UNPROCESSABLE_ENTITY)
            );
        }

        const { name, scopes = [] } = req.body;

        const applicationObject = {
            name: name,
            scopes: scopes
        };

        const application = new Application({
            ...applicationObject,
            user: req.user.id
        });

        try {
            await application.save();

            return res.send({ application });
        } catch (error) {
            return next(error);
        }
    }
}

export default ApplicationsController;