/**
 * Created with IntelliJ IDEA.
 * User: dingye
 * Date: 14-1-22
 * Time: 下午1:23
 * To change this template use File | Settings | File Templates.
 */
window.Config = {

    children: [
        {
            text: 'Home',
            icon: '/public/images/t1.png'
        },
        {
            text: 'HTML/CSS',
            icon: '/public/images/t2.png',
            children: [
                {
                    text: 'Link 1'
                },
                {text: 'Link 2'},
                {text: 'Link 3'},
                {
                    text: 'Link 4'
                },
                {
                    text: 'Link 5'
                }
            ]
        },
        {
            text: 'JQuery/JS',
            icon: '/public/images/t3.png',

            children: [
                {
                    text: 'Link 6'
                },
                {text: 'Link 7'},
                {text: 'Link 8'},
                {
                    text: 'Link 9'
                },
                {
                    text: 'Link 10'
                }
            ]
        },
        {
            text: 'PHP',
            icon: '/public/images/t2.png'
        },
        {
            text: 'MySQL',
            icon: '/public/images/t2.png'
        },
        {
            text: 'XSLT',
            icon: '/public/images/t2.png'
        }
    ]

}
