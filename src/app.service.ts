import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { PrismaService } from './lib/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateMessageDTO } from './dto/create-message.dto';

@Injectable()
export class AppService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async createUser(createUserDTO: CreateUserDTO) {
    const { username } = createUserDTO;

    const userWithSameUsername = await this.prismaService.user.findFirst({
      where: {
        username,
      },
    });

    if (userWithSameUsername) {
      throw new UnprocessableEntityException('username has already been used');
    }

    const { newUser, token } = await this.prismaService.$transaction(
      async (tx) => {
        const newUser = await tx.user.create({
          data: {
            username,
          },
        });

        const token = await this.jwtService.signAsync({
          userId: newUser.userId,
        });

        return {
          newUser,
          token,
        };
      },
    );

    return {
      id: newUser.id,
      username: newUser.username,
      token,
    };
  }

  async createMessage(createMessageDTO: CreateMessageDTO, fromUserId: string) {
    const { messageBody, toUsername } = createMessageDTO;

    const toUser = await this.prismaService.user.findFirst({
      where: {
        username: toUsername,
      },
    });

    if (!toUser) {
      throw new UnprocessableEntityException('recipient user not found');
    }

    const senderUser = await this.prismaService.user.findFirst({
      where: {
        userId: fromUserId,
      },
    });

    if (toUser.id === senderUser.id) {
      throw new UnprocessableEntityException('cannot send message to self');
    }

    const message = await this.prismaService.message.create({
      data: {
        body: messageBody,
        fromUser: {
          connect: senderUser,
        },
        toUser: {
          connect: toUser,
        },
      },
      include: {
        fromUser: true,
        toUser: true,
      },
    });

    return message;
  }

  async getMessages(userId: string) {
    const messages = await this.prismaService.message.findMany({
      where: {
        toUser: {
          userId,
        },
      },
      take: 50,
      select: {
        body: true,
        id: true,
        messageId: true,
        createdAt: true,
        isRead: true,
      },
    });

    return messages;
  }

  async getMessage(userId: string, messageId: string) {
    const message = await this.prismaService.message.findFirst({
      where: {
        messageId,
        toUser: {
          userId,
        },
      },
      select: {
        body: true,
        id: true,
        messageId: true,
        createdAt: true,
        isRead: true,
      },
    });

    if (!message) {
      throw new NotFoundException('message not found');
    }

    await this.prismaService.message.update({
      where: {
        id: message.id,
      },
      data: {
        isRead: true,
      },
    });

    return message;
  }
}
