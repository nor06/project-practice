import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../models/user.entity';
import { Repository } from 'typeorm';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { User } from '../models/user.interface';

@Injectable()
export class UserService {


    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
    )   {}

    create(user: User): Observable<User>{
        return from(this.userRepository.save(user));
    }

    findOne(id: number): Observable<User> {
        return from(this.userRepository.findOne({ where: { id } })).pipe(
            catchError(err => {
                console.error('Error finding user:', err);
                return throwError(() => new Error('Could not find user'));
            }),
            map(user => {
                if (!user) {
                    throw new Error(`User with ID ${id} not found`);
                }
                return user; // Return the found user
            })
        );
    }
    

    findAll(): Observable<User[]> {
        return from(this.userRepository.find());
    }

    deleteOne(id: number): Observable<any> {
        return from(this.userRepository.delete(id));
    }

    updateOne(id: number, user: User): Observable<any> {
        return from(this.userRepository.update(id, user));
    } 
}
