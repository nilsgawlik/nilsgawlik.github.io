/*jslint white: true*/
/*jslint node: true */
/*jslint vars: true*/
/*jslint eqeq: true*/
/*jslint plusplus: true*/
"use strict";

//utility
Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};

Math.angle_difference = function(from, to) {
    return (to - from + 180).mod(360) - 180;
};

Math.degtorad = function(degrees) {
  return degrees * Math.PI / 180;
};
 
Math.radtodeg = function(radians) {
  return radians * 180 / Math.PI;
};

Math.sign = function(x) {
    return x?x<0?-1:1:0;
};

Math.distance_ld = function(l1, d1, l2, d2){
    return Math.sqrt(l1*l1 + l2*l2 - 2*l1*l2*Math.cos(Math.degtorad(d2-d1)));
};


function start()
{
    var actors, interval;
    var left=false;
    var right=false;
    var space=false;
    var time = 0;
    var spawn_cool = 0;
    var state = Object.freeze({
        ingame: 0,
        game_over: 1
    });
    var core_state = Object.freeze({
        clockwise: 0,
        counter: 1,
        random: 2,
        chase: 3,
        length: 4
    });
    var game_state = state.ingame;
    var ready_for_restart = false;
    var action = 0;
    document.addEventListener('keydown', function(event) 
    {
        if(game_state == state.game_over && ready_for_restart)
        {
            setTimeout(location.reload(), 1000);
            //setTimeout(document.start, 1000);
        }
        
        if(event.keyCode == 37) { left = true; }
        else if(event.keyCode == 39) { right = true; }
        else if(event.keyCode == 32) { 
            event.preventDefault(); 
            space = !space; 
        }
    });
    document.addEventListener('keyup', function(event) 
    {
        if(event.keyCode == 37) { left = false; }
        else if(event.keyCode == 39) { right = false; }
    });
    
    var canvas = document.getElementById("game");
    var buffer = document.getElementById("game_buffer");
    buffer.style.visibility = "hidden";
    
    function draw_actor(actor)
    {
        var ctx = buffer.getContext("2d");
        ctx.beginPath();
        ctx.arc(300+Math.cos(Math.degtorad(actor.d)) * actor.l, 
                300+Math.sin(Math.degtorad(actor.d)) * actor.l, actor.rad, 0, 2*Math.PI);
        ctx.fillStyle = "black";
        ctx.fillStyle = actor.color;
        ctx.fill();
    }
    
    var player = {
        l:250,
        d:0,
        dspd:0,
        acc:0.7,
        rad:20,
        mspd:3,
        color: "black",
        onstep: function(a){
            var i;
            //player code
            if(left){
                a.dspd += a.acc*2;
            }
            if(right){
                a.dspd -= a.acc*2;
            }
            a.dspd = Math.max(-a.mspd, Math.min(a.mspd, a.dspd));
            a.dspd -= Math.sign(a.dspd) * Math.min(a.acc, Math.abs(a.dspd));
            a.d += a.dspd;
            
            //collision
            for(i = 0; i < actors.length; i++)
            {
                if(actors[i] !== a){
                    var dis = Math.distance_ld(a.l, a.d, actors[i].l, actors[i].d);
                    if(dis < a.rad + actors[i].rad){
                        var ov = Math.distance_ld(actors[i].l, actors[i].d, actors[i].l+actors[i].lspd, actors[i].d+actors[i].dspd);
                        actors[i].dspd = Math.angle_difference(a.d, actors[i].d)/dis*ov;
                        actors[i].lspd = Math.angle_difference(a.l, actors[i].l)/dis*ov;
                        actors[i].color = "red";
                    }
                }
            }
        }
    };  
    
    var core = {
        l:0,
        d:0,
        rad:40,
        color: "black",
        hit_cool: 0,
        change_phase_t: 300,
        change_number_t: 500,
        cur_state: core_state.chase,
        onstep: function (a){
            if(a.rad > 250 - player.rad){
                game_state = state.game_over;
                setTimeout(function(){ready_for_restart = true;}, 1000);
            }
            
            if(a.hit_cool > 0){
                a.hit_cool--;
                a.color = "red";//rgb(" + (a.hit_cool*256/15).toString() + ", 0, 0);";
            }
            else{
                a.color = "black";
            }

            //state changing
            if(time % core.change_phase_t == 0 )
            {
                core.cur_state = Math.floor(Math.random()*core_state.length);
            }
        },
        onhit: function (a){
            a.hit_cool = 15;
            a.rad += 5;
            action += 15;
            action = Math.min(action, 100);
        }
    };  
    
    actors = [player, core];
    
    function createEnemy()
    {
        function createBaseEnemy(){            
            return {
                l: 0,
                d: 0,
                rad: 15,
                lspd: 3 + time / 500,
                dspd: 0,
                color: "black",
                out: false,
                onstep: function (a){
                    a.l += a.lspd;
                    a.d += a.dspd;
                    if(a.l > 600){
                        actors.splice(actors.indexOf(a), 1);
                    }

                    if(a.l > core.rad-a.rad) 
                    {
                        a.out = true;
                    }
                    else if(a.out)
                    {
                        core.onhit(core);
                        actors.splice(actors.indexOf(a), 1);
                    }
                }
            };
        }
        var lvl = Math.floor(time/core.change_number_t);
        var i;
        action += 2;
        
        if(core.cur_state == core_state.random)
            lvl = 1;
        
        for(i = 0; i < lvl+1; i++)
        {
            var e = createBaseEnemy();
            if(core.cur_state == core_state.clockwise)
            {
                e.d = time + i * (360/(lvl+1));
            }
            else if(core.cur_state == core_state.counter)
            {
                e.d = -time + i * (360/(lvl+1));                
            }
            else if(core.cur_state == core_state.random)
            {
                e.d = Math.random()*360 + i * (360/(lvl+1));
            }
            else if(core.cur_state == core_state.chase)
            {
                e.d = player.d + i * (360/(lvl+1));
            }
            actors.push(e);
        }
    }
    
    //main loop
    function run()
    {
        //pausing the game
        if(space){
            return;
        }
        
        if(action > 1)
            action -= 1;
        
        if (game_state == state.ingame)
        {
            time++;
            //enemy spawn
            if(spawn_cool-- < 0)
            {
                spawn_cool = 30/(1+time/200);
                createEnemy();
            }
            //actors move
            actors.map(function (a){
                a.onstep(a);
            });
        }
        
        //draw
        var ctx = buffer.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        actors.map(draw_actor);
        
        if(game_state == state.game_over)
        {
            ctx.fillStyle = "rgba(0,0,0,0.8)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";
            ctx.font = "30px Verdana";
            ctx.textAlign = "center";
            ctx.fillText("you surived "+Math.round(time/60*100)/100+" seconds.", 300, 300);
        }
        else{            
            ctx.fillStyle = "black";
            ctx.font = "16px Verdana";
            ctx.textAlign = "left";
            ctx.fillText(Math.round(time/60*100)/100, 2, 20);
        }
            
        
        ctx = canvas.getContext("2d");
        ctx.fillStyle = "hsla(0,0%,100%,0.4)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if(Math.random() > 0.01 * action)
            ctx.drawImage(buffer, 0, 0);
        else
            ctx.drawImage(buffer, (Math.random()-0.5)*50, (Math.random()-0.5)*50);
    }
    interval = setInterval(run, 1000 / 60);
}

window.onload = start;