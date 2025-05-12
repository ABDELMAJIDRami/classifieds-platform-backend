import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { AdsService } from './ads.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { ModerateAdDto } from './dto/moderate-ad.dto';
import {AdStatus} from "./entities/ad-version.entity";
import {Role} from "../auth/decorators/role.decorator";
import {AuthenticatedGuard} from "../auth/guards/authenticated.guard";
import {RoleGuard} from "../auth/guards/role.guard";

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  // Public endpoints
  @Get('public')
  getPublicAds() {
    return this.adsService.getPublicAds();
  }

  // @Get('public/:id')
  // getPublicAd() {
  //   // return this.adsService.getPublicAds();
  // }

  // User endpoints
  @Get('my')
  @UseGuards(AuthenticatedGuard)
  getUserAds(@Request() req) {
    return this.adsService.getUserAds(req.user.id);
  }

  @Get('my/:id')
  @UseGuards(AuthenticatedGuard)
  findMyAd(@Param('id') id: string, @Request() req) {
    console.log(id, req.user)
    return this.adsService.findOne(+id, req.user.id);
  }

  @Post()
  @UseGuards(AuthenticatedGuard)
  create(@Body() createAdDto: CreateAdDto, @Request() req) {
    return this.adsService.create(createAdDto, req.user);
  }

  @Patch(':id')
  @UseGuards(AuthenticatedGuard)
  update(@Param('id') id: string, @Body() updateAdDto: UpdateAdDto, @Request() req) {
    return this.adsService.update(+id, updateAdDto, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthenticatedGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.adsService.remove(+id, req.user);
  }

  // Admin endpoints
  @Get('pending')
  @Role('manager')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  getPendingAds() {
    return this.adsService.getPendingAds();
  }

  @Get('all')
  @Role('manager')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  getAllAds(@Query('status') status?: AdStatus) {
    return this.adsService.findAll({ status });
  }

  @Get(':id')
  @Role('manager')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  findOne(@Param('id') id: string) {
    return this.adsService.findOne(+id);
  }

  @Patch(':id/versions/:versionId/moderate')
  @Role('manager')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  moderate(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Body() moderateAdDto: ModerateAdDto,
    @Request() req
  ) {
    return this.adsService.moderate(+id, +versionId, moderateAdDto, req.user);
  }
}