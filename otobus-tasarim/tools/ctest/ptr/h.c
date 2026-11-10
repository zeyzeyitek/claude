#include <stdio.h>
#include <stdlib.h>
extern unsigned char ST,OUT_A,OUT_B,OUT_C,IN1,IN2; extern unsigned short OUT_D; void M_10ms(void);
int main(int c,char**v){srand(atoi(v[1]));for(int s=0;s<atoi(v[2]);s++){IN1=rand()%9;IN2=rand()%2;printf("I %u %u\n",IN1,IN2);M_10ms();printf("O %u %u %u %u %u\n",ST,OUT_A,OUT_B,OUT_C,OUT_D);}return 0;}
