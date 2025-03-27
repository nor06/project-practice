import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../models/user.entity';
import { Repository } from 'typeorm';
import { User } from '../models/user.interface';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, map, catchError} from 'rxjs/operators';
import { AuthService } from 'src/auth/services/auth.service';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        private authService: AuthService
    ) {}

    create(user: User): Observable<Omit<User, 'password'>> {
        return this.authService.hashPassword(user.password).pipe(
            switchMap((passwordHash: string) => {
                const newUser = new UserEntity();
                newUser.name = user.name;
                newUser.username = user.username;
                newUser.email = user.email;
                newUser.password = passwordHash;
                newUser.role = user.role;
    
                return from(this.userRepository.save(newUser)).pipe(
                    map((savedUser: UserEntity) => {
                        const { password, ...result } = savedUser;
                        return result; // Now TypeScript will accept this
                    }),
                    catchError((err) => {
                        console.error('Error saving user to database:', err.message);
                        return throwError(() => new Error('Failed to save user to database.'));
                    })
                );
            }),
            catchError((err) => {
                console.error('Error hashing password:', err.message);
                return throwError(() => new Error('Failed to hash password.'));
            })
        );
    }

    findOne(id: number): Observable<User> {
        return from(this.userRepository.findOne({ where: { id } })).pipe(
            map((user: UserEntity | null) => {
                if (!user) {
                    throw new Error(`User with ID ${id} not found.`);
                }
    
                // Exclude the password field
                const { password, ...result } = user; // Safe destructuring since we've checked user exists
                return result as User; // Ensure the result matches the User type
            }),
            catchError((err) => {
                console.error(`Error finding user with ID ${id}:`, err.message);
                return throwError(() => new Error('Failed to retrieve user.'));
            })
        );
    }

    findAll(): Observable<User[]> {
        return from(this.userRepository.find()).pipe(
            map((users: UserEntity[]) => {
                return users.map((user) => {
                    const { password, ...result } = user; // Safely exclude the password field
                    return result as User; // Cast the result to match the User type
                });
            }),
            catchError((err) => {
                console.error('Error fetching users:', err.message);
                return throwError(() => new Error('Failed to retrieve users.'));
            })
        );
    }

    deleteOne(id: number): Observable<any> {
        return from(this.userRepository.delete(id));
    }

    updateOne(id: number, user: User): Observable<any> {
        // Exclude email and password by creating a new object without these properties
        const { email, password, ...updateData } = user;
    
        return from(this.userRepository.update(id, updateData));
    }

    updateRoleOfUser(id: number, user: User): Observable<any> {
        return from(this.userRepository.update(id, user));
    }

    login(user: User): Observable<string> {
        return this.validateUser(user.email, user.password).pipe(
            switchMap((user: User) => {
                if(user) {
                    return this.authService.generateJWT(user).pipe(map((jwt: string) => jwt));
                } else {
                    return 'Wrong Credentials';
                }
            })
        )
    }

    validateUser(email: string, password: string): Observable<User> {
        return this.findByMail(email).pipe(
            switchMap((user: User | null) => {
                if (!user) {
                    throw new Error('User not found'); // Handle case when no user is found
                }
                return this.authService.comparePasswords(password, user.password).pipe(
                    map((match: boolean) => {
                        if (match) {
                            const { password, ...result } = user; // Exclude password field
                            return result as User; // Cast result back to User type
                        } else {
                            throw new Error('Invalid password'); // Handle incorrect password
                        }
                    })
                );
            }),
            catchError((err) => {
                console.error('Validation error:', err.message);
                return throwError(() => new Error('Validation failed.'));
            })
        );
    }

    findByMail(email: string): Observable<User | null> {
        return from(
            this.userRepository.findOne({
                where: { email }, // Correct syntax for specifying the `where` clause
            })
        ).pipe(
            map((user: UserEntity | null) => {
                if (!user) {
                    console.warn(`No user found with email: ${email}`);
                }
                return user; // Return the user (can be null if not found)
            }),
            catchError((err) => {
                console.error('Error finding user by email:', err.message);
                return throwError(() => new Error('Failed to find user by email.'));
            })
        );
    }
}