import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { AuthGuard } from './auth/auth.guard';
import { CreateMessageDTO } from './dto/create-message.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/users')
  async createUser(@Body() createUserDTO: CreateUserDTO) {
    return await this.appService.createUser(createUserDTO);
  }

  @Post('/messages')
  @UseGuards(AuthGuard)
  async createMessage(
    @Body() createMessageDTO: CreateMessageDTO,
    @Request() req: { userId: string },
  ) {
    return await this.appService.createMessage(createMessageDTO, req.userId);
  }

  @UseGuards(AuthGuard)
  @Get('/messages')
  async getMessages(@Request() req: { userId: string }) {
    return await this.appService.getMessages(req.userId);
  }

  @UseGuards(AuthGuard)
  @Get('/messages/:messageId')
  async getMessage(
    @Request() req: { userId: string },
    @Param('messageId') messageId: string,
  ) {
    return await this.appService.getMessage(req.userId, messageId);
  }
}
