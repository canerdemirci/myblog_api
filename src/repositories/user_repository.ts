/**
 * @module
 * @class UserRepository
 * This repository used for crud operations at users.
 */

import prismaClient from "../utils/prismaClient"

import CreateUserDTO from "../dtos/user/CreateUserDTO"
import UserDTO from "../dtos/user/UserDTO"

export default class UserRepository {
    /**
     * Creates a user in the database.
     * @param createUserDTO CreateUserDTO
     * @throws Error
     * @returns Promise < UserDTO >
     */
    async createUser(createUserDTO: CreateUserDTO) : Promise<UserDTO> {
        const user = await prismaClient.user.create({
            data: {
                email: createUserDTO.email,
                name: createUserDTO.name,
                image: createUserDTO.image,
                password: createUserDTO.password,
                provider: createUserDTO.provider,
                providerId: createUserDTO.providerId
            },
        })
        
        return UserDTO.fromDB(user)
    }

    /**
     * Fetchs all users from database.
     * @throws Error
     * @returns Promise < UserDTO[] >
     */
    async getUsers() : Promise<UserDTO[]> {
        const users = await prismaClient.user.findMany({
            orderBy: { email: 'asc' },
        })

        return users.map(u => UserDTO.fromDB(u))
    }

    /**
     * Fetchs a users by id from database.
     * @param id string
     * @throws Error
     * @returns Promise < UserDTO >
     */
    async getUser(id: string) : Promise<UserDTO> {
        const user = await prismaClient.user.findFirstOrThrow({
            where: { id: id },
        })
        
        return UserDTO.fromDB(user)
    }

    /**
     * Fetchs a users by email from database.
     * @param email string 
     * @throws Error
     * @returns Promise < UserDTO >
     */
    async getUserByEmail(email: string) : Promise<UserDTO> {
        const user = await prismaClient.user.findFirstOrThrow({
            where: { email: email },
        })
        
        return UserDTO.fromDB(user)
    }

    /**
     * Fetchs a users by provider id from database.
     * @param providerId string 
     * @throws Error
     * @returns Promise < UserDTO >
     */
    async getUserByProviderId(providerId: string) : Promise<UserDTO> {
        const user = await prismaClient.user.findFirstOrThrow({
            where: { providerId: providerId },
        })
        
        return UserDTO.fromDB(user)
    }

    /**
     * Fetchs a users by email and password from database.
     * @param email string 
     * @param password string 
     * @throws Error
     * @returns Promise < UserDTO >
     */
    async getUserByEmailAndPassword(email: string, password: string) : Promise<UserDTO> {
        const user = await prismaClient.user.findFirstOrThrow({
            where: { email: email, password: password },
        })
        
        return UserDTO.fromDB(user)
    }

    /**
     * Updates a users in database.
     * @param id string 
     * @param image string 
     * @param name string 
     * @throws Error
     * @returns Promise < void >
     */
    async updateUser(id: string, image?: string, name?: string) : Promise<void> {
        if (!image && !name) return

        await prismaClient.user.update({
            where: {
                id: id
            },
            data: {
                image: image,
                name: name
            }
        })
    }

    /**
     * Deletes a users by id from database.
     * @param id string 
     * @throws Error
     * @returns Promise < void >
     */
    async deleteUser(id: string) : Promise<void> {
        await prismaClient.user.delete({ where: { id: id } })
    }
}