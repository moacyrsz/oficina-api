import { ApiProperty } from '@nestjs/swagger';

export class TokenResponse {
  @ApiProperty({ description: 'Token JWT de acesso' })
  accessToken: string;

  @ApiProperty({ example: 'Bearer' })
  tipo: string;

  @ApiProperty({ example: '3600s', description: 'Tempo de expiracao do token' })
  expiraEm: string;
}
