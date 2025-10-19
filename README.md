# Reppley

## 적용 방법
[적용 튜토리얼 바로가기](https://swoon1.tistory.com/12)

## 주의 사항
AI Studio 무료 사용자의 경우 Google이 학습을 위해 대화 기록을 수집해 갈수 있는점 유의 바랍니다.
하지만 프롬프트는 학습 하지 않습니다.

[디스코드](https://discord.gg/qgYCu27wJa)

## World Simulation Prototype

새로운 `game/` 디렉터리에는 시민 플레이, 국가 생성, 질병/전쟁 시뮬레이션 등 사용자가 요청한 게임 루프를 프로토타입으로 구현한 Node.js 스크립트가 포함되어 있습니다. 아래 명령으로 실행할 수 있습니다.

```bash
node game/index.js --year=2020 --prompt="Rome survives to 2020" --nation="Nova Roma" --occupation=Engineer --days=60 --output=rome_sim.json
```

명령줄 옵션, 기능, 출력 구조 등 상세 내용은 `game/README.md`에서 확인하세요.
