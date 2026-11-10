typedef unsigned char boolean_T; typedef unsigned char uint8_T; typedef unsigned short uint16_T; typedef unsigned int uint32_T;
typedef uint8_T Dem_EventStatusType; typedef uint8_T Std_ReturnType;
typedef struct { boolean_T y1; uint8_T cnt; uint16_T acc[4]; } B_T;
typedef struct { uint8_T last; } DW_T;
B_T M_B; DW_T M_DW; uint8_T ST; uint8_T OUT_A, OUT_B, OUT_C; uint16_T OUT_D; uint8_T IN1, IN2;
static Std_ReturnType Dem_GetEventStatus(uint8_T id, Dem_EventStatusType *status)
{
  if (id > 3U) { *status = 0U; return 1U; }
  *status = (Dem_EventStatusType)(id * 2U + 1U);
  return 0U;
}
void Btn_Outputs_wrapper(const boolean_T *u0, const boolean_T *u1, boolean_T *y0, uint8_T *y1)
{
  y0[0] = (boolean_T)(u0[0] || u1[0]);
  *y1 = (uint8_T)(*y1 + (u0[0] ? 2U : 1U));
}
static void sub(B_T *b, DW_T *dw, uint16_T *arr)
{
  b->cnt++;
  arr[2] = (uint16_T)(arr[2] + b->cnt);
  dw->last = b->cnt;
  (*b).y1 = (boolean_T)!(*b).y1;
}
void M_10ms(void)
{
  boolean_T loc_y = 0; uint8_T loc_c = 5U; boolean_T u0 = IN1 != 0U, u1 = IN2 != 0U;
  Dem_EventStatusType st = 9U;
  (void)Dem_GetEventStatus(IN1 & 7U, &st);
  ST = st;
  Btn_Outputs_wrapper(&u0, &u1, &loc_y, &loc_c);
  Btn_Outputs_wrapper(&u0, &u1, &M_B.y1, &OUT_C);
  sub(&M_B, &M_DW, &M_B.acc[0]);
  OUT_A = (uint8_T)(loc_y + loc_c);
  OUT_B = (uint8_T)(M_DW.last + M_B.y1);
  OUT_D = M_B.acc[2];
}
