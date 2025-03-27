import { Injectable, CanActivate, ExecutionContext, Inject, forwardRef } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserService } from "src/user/service/user.service";
import { Observable } from "rxjs";
import { User } from "src/user/models/user.interface";
import { map } from "rxjs/operators";


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,

        @Inject(forwardRef(() => UserService))
        private userService: UserService
    ) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }
    
        const request = context.switchToHttp().getRequest();
        const user: User = request.user; // Directly access `request.user`
    
        if (!user || !user.id) {
            console.warn('User not authenticated or ID is missing');
            return false;
        }
    
        return this.userService.findOne(user.id).pipe(
            map((foundUser: User) => {
                if (!foundUser) {
                    console.warn(`User with ID ${user.id} not found`);
                    return false;
                }
    
                const hasRole = roles.includes(foundUser.role);
                console.log(`User role: ${foundUser.role}, Required roles: ${roles}`);
                return hasRole;
            })
        );
    }
}    