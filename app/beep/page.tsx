
'use client'

import { Button } from "@/components/ui/button";

const BeepButton = () => {

  return (
    <div>
      <Button onClick={beep}>Play Beep</Button>
    </div>
  );
};

export default BeepButton;

function beep() {
  // var snd = new Audio("data:audio/wav;base64,"+base64String);
  // snd.play();
}
