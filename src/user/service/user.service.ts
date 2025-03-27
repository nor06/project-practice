import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../models/user.entity';
import { Repository } from 'typeorm';
import { User, UserRole } from '../models/user.interface';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, map, catchError} from 'rxjs/operators';
import { AuthService } from 'src/auth/services/auth.service';
import {paginate, Pagination, IPaginationOptions} from 'nestjs-typeorm-paginate';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        private authService: AuthService
    ) {}

    create(user: User): Observable<Omit<User, 'password'>> {
        if (!user.password) {
            return throwError(() => new Error('Password is required.'));
        }
    
        return this.authService.hashPassword(user.password).pipe(
            switchMap((passwordHash: string) => {
                const newUser = new UserEntity();
                newUser.name = user.name;
                newUser.username = user.username;
                newUser.email = user.email;
                newUser.password = passwordHash;
                newUser.role = UserRole.USER;
    
                console.log('Creating user:', newUser); // Debugging
    
                return from(this.userRepository.save(newUser)).pipe(
                    map((savedUser: UserEntity) => {
                        const { password, ...result } = savedUser; // Exclude password
                        return result; // Ensure the return type matches Omit<User, 'password'>
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

    paginate(options: IPaginationOptions): Observable<Pagination<User>> {
        return from(paginate<User>(this.userRepository, options)).pipe(
          map((usersPageable: Pagination<User>) => {
            usersPageable.items.forEach((user: User) => {
              if (user.password) {
                delete user.password; // Remove the password field if it exists
              }
            });
      
            return usersPageable;
          })
        );
      }
      



    deleteOne(id: number): Observable<any> {
        return from(this.userRepository.delete(id));
    }

    updateOne(id: number, user: Partial<User>): Observable<any> {
        const { email, password, role, ...updateData } = user; // Exclude unwanted fields
    
        return from(this.userRepository.update(id, updateData)).pipe(
            catchError((err) => {
                console.error('Error updating user:', err.message);
                return throwError(() => new Error('Failed to update user.'));
            })
        );
    }
    
    

    updateRoleOfUser(id: number, user: User): Observable<any> {
        return from(this.userRepository.update(id, user));
    }

    login(user: User): Observable<string> {
        if (!user.email || !user.password) {
            return throwError(() => new Error('Email and password are required.'));
        }
    
        return this.validateUser(user.email, user.password).pipe(
            switchMap((validatedUser: User) => {
                if (validatedUser) {
                    return this.authService.generateJWT(validatedUser).pipe(
                        map((jwt: string) => jwt)
                    );
                } else {
                    return throwError(() => new Error('Wrong credentials.'));
                }
            })
        );
    }
    

    validateUser(email: string, password: string): Observable<Omit<User, 'password'>> {
        return this.findByMail(email).pipe(
            switchMap((user: User | null) => {
                if (!user) {
                    throw new Error('User not found'); // Handle user not found
                }
    
                if (!user.password) {
                    throw new Error('Password not found in user record'); // Ensure password exists
                }
    
                return this.authService.comparePasswords(password, user.password).pipe(
                    map((match: boolean) => {
                        if (match) {
                            const { password, ...result } = user; // Exclude password field
                            return result; // TypeScript infers this as Omit<User, 'password'>
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