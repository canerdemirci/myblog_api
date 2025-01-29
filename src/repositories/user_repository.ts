/**
 * @module userRepository
 * This repository used for crud operations at users.
 */

import prismaClient from "../utils/prismaClient"
import CreateUserDTO from "../dtos/user/CreateUserDTO"
import UserDTO from "../dtos/user/UserDTO"

export default class UserRepository {
    /**
     * This function takes CreateUserDTO then creates an user in the database.
     * Then returns it as a UserDTO.
     * If an error occurs it throws.
     * @param createUserDTO CreateUserDTO
     * @returns Promise<UserDTO>
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
     * This function fetchs all users from database and returns
     * them as an Array of UserDTO.
     * If an error occurs it throws.
     * @returns Promise<UserDTO[]>
     */
    async getUsers() : Promise<UserDTO[]> {
        const users = await prismaClient.user.findMany({
            orderBy: { email: 'asc' },
        })

        return users.map(u => UserDTO.fromDB(u))
    }

    /**
     * This function fetchs an user by id from database.
     * Then returns it as a UserDTO.
     * If an error occurs it throws.
     * @param id string
     * @returns Promise<UserDTO>
     */
    async getUser(id: string) : Promise<UserDTO> {
        const user = await prismaClient.user.findFirstOrThrow({
            where: { id: id },
        })
        
        return UserDTO.fromDB(user)
    }

    /**
     * This function fetchs an user by email from database.
     * Then returns it as a UserDTO.
     * If an error occurs it throws.
     * @param email string
     * @returns Promise < UserDTO >
     */
    async getUserByEmail(email: string) : Promise<UserDTO> {
        const user = await prismaClient.user.findFirstOrThrow({
            where: { email: email },
        })
        
        return UserDTO.fromDB(user)
    }

    /**
     * This function fetchs an user by providerId from database.
     * Then returns it as a UserDTO.
     * If an error occurs it throws.
     * @param providerId string
     * @returns Promise<UserDTO>
     */
    async getUserByProviderId(providerId: string) : Promise<UserDTO> {
        const user = await prismaClient.user.findFirstOrThrow({
            where: { providerId: providerId },
        })
        
        return UserDTO.fromDB(user)
    }

    /**
     * This function fetchs an user by email and password from database.
     * Then returns it as a UserDTO.
     * If an error occurs it throws.
     * @param email string
     * @param password string
     * @returns Promise<UserDTO>
     */
    async getUserByEmailAndPassword(email: string, password: string) : Promise<UserDTO> {
        const user = await prismaClient.user.findFirstOrThrow({
            where: { email: email, password: password },
        })
        
        return UserDTO.fromDB(user)
    }

    /**
     * This function updates user data by id.
     * @param id string
     * @param image string
     * @param name string
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
     * This function deletes an user by given id.
     * If an error occurs it throws.
     * @param id string
     * @returns Promise < void >
     */
    async deleteUser(id: string) : Promise<void> {
        await prismaClient.user.delete({ where: { id: id } })
    }
}